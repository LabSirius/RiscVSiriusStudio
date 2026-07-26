/* eslint-disable @typescript-eslint/naming-convention */
import { describe, it, expect } from "vitest";
import { compile } from "../utilities/riscvc";
import { SCCPU, type SCCPUResult } from "./singlecycle";
import { PipelineCPU } from "./pipeline/pipeline";
import type { ICPU } from "./interface";
import { DecodedInstruction } from "./instruction";

/**
 * Golden-output integration net for the DecodedInstruction migration.
 *
 * A small RISC-V program is assembled and run headless (no VS Code host)
 * through BOTH CPU models to completion. The final register file and data
 * memory are snapshotted as a golden reference, captured against the current
 * pre-migration behaviour. Any later behaviour drift surfaces as a snapshot
 * diff.
 *
 * The two CPUs are snapshotted independently on purpose: their store
 * behaviour already differs today (the monocycle driver writes a full word
 * for every store width, the pipeline writes only the accessed bytes), so the
 * net pins each CPU to itself rather than asserting the two agree.
 *
 * The program exercises every load/store form (`lb`, `lbu`, `lh`, `lhu`,
 * `lw`, `sb`, `sh`, `sw`) plus a branch (`beq`) and a jump (`jal`) — the code
 * most prone to silent breakage during the migration.
 *
 * Note: the shipped generated parser (`riscv.ts`) cannot assemble `lbu`/`lhu`
 * (its `Instruction` rule rejects them, even though the `.peg` source lists
 * them). Rather than regenerate the parser — a production change out of scope
 * for this ticket — the two unsigned loads are synthesized by assembling `lb`
 * / `lh` and flipping their `funct3` (see `synthesizeUnsignedLoads`). The CPUs
 * decode load width and signedness from `funct3`, so this exercises the exact
 * `lbu`/`lhu` code paths the migration must preserve.
 */

const MEMORY_SIZE = 128;
const MAX_STEPS = 1000;

// Uses only base instructions (no pseudo-ops) so the assembled instruction
// stream is predictable. Base register x0 addresses the writable data region,
// which starts at address 0 when the program declares no data directives.
const PROGRAM = `
main:
    addi x5,  x0, 5          # x5 = 5   (branch operand)
    addi x6,  x0, -1         # x6 = 0xFFFFFFFF
    sw   x6,  0(x0)          # store word    -> mem[0..3]
    addi x7,  x0, 18         # 0x12
    sb   x7,  4(x0)          # store byte    -> mem[4]
    addi x8,  x0, 52         # 0x34
    sh   x8,  8(x0)          # store half    -> mem[8..9] = 0x0034
    lw   x11, 0(x0)          # load word     -> 0xFFFFFFFF
    lb   x12, 0(x0)          # load byte     -> sign-extended 0xFF = -1
    lb   x13, 0(x0)          # synthesized to lbu -> 0x000000FF = 255
    lh   x14, 0(x0)          # load half of mem[0] (0xFFFF) -> sign-ext 0xFFFFFFFF
    lh   x15, 0(x0)          # synthesized to lhu -> 0x0000FFFF
    beq  x5,  x5, taken      # branch taken (5 == 5)
    addi x20, x0, 999        # skipped when branch taken
taken:
    addi x21, x0, 7          # x21 = 7
    jal  x1,  done           # jump, links PC+4 into x1
    addi x22, x0, 888        # skipped when jump taken
done:
    addi x23, x0, 42         # x23 = 42
`;

// Control-flow net: every branch condition (beq/bne/blt/bge/bltu/bgeu) in both
// taken and not-taken outcomes, a register-indirect jump (jalr) used as a
// subroutine return, and a backward-branch countdown loop. Operand registers
// are settled up front so branch outcomes never ride on a hazard corner case,
// and every "skipped" instruction writes a 100 marker that must stay absent
// from the snapshot — a mis-taken branch would leak it in.
//
// The shipped parser rejects `bltu`/`bgeu` (see the `PROGRAM` note above: the
// generated parser lags its `.peg` source), so the four unsigned branches are
// written as `blt`/`bge` placeholders and rewritten to their unsigned form by
// flipping `funct3` in `synthesizeUnsignedBranches` — the same technique the
// load/store net uses for `lbu`/`lhu`. The parser also rejects labels with
// uppercase letters, underscores, or a mnemonic prefix (`beqt` reads as `beq`),
// so labels take a `g` prefix and pack the case into the suffix (`gbltut` =
// "bltu taken", `gbgeun` = "bgeu not-taken"). No lui/auipc appears (0xFFFFFFFF
// is materialized with `addi x8, x0, -1`).
const CONTROL_FLOW_PROGRAM = `
main:
    addi x5,  x0, 5          # a = 5
    addi x6,  x0, 5          # b = 5  (== a)
    addi x7,  x0, 10         # c = 10 (> a, both signed and unsigned)
    addi x8,  x0, -1         # d = 0xFFFFFFFF (signed -1, unsigned max)

    beq  x5, x6, gbeqt       # taken: 5 == 5
    addi x10, x0, 100        # skipped
gbeqt:
    beq  x5, x7, gbeqn       # not taken: 5 != 10
    addi x11, x0, 1          # executed on fall-through
gbeqn:

    bne  x5, x7, gbnet       # taken: 5 != 10
    addi x12, x0, 100        # skipped
gbnet:
    bne  x5, x6, gbnen       # not taken: 5 == 5
    addi x13, x0, 1          # executed on fall-through
gbnen:

    blt  x8, x5, gbltt       # taken (signed): -1 < 5
    addi x14, x0, 100        # skipped
gbltt:
    blt  x7, x5, gbltn       # not taken (signed): 10 < 5 is false
    addi x15, x0, 1          # executed on fall-through
gbltn:

    bge  x5, x6, gbget       # taken (signed): 5 >= 5
    addi x16, x0, 100        # skipped
gbget:
    bge  x8, x5, gbgen       # not taken (signed): -1 >= 5 is false
    addi x17, x0, 1          # executed on fall-through
gbgen:

    blt  x5, x8, gbltut      # -> bltu, taken (unsigned): 5 < 0xFFFFFFFF
    addi x18, x0, 100        # skipped
gbltut:
    blt  x8, x5, gbltun      # -> bltu, not taken: 0xFFFFFFFF < 5 is false
    addi x19, x0, 1          # executed on fall-through
gbltun:

    bge  x8, x5, gbgeut      # -> bgeu, taken (unsigned): 0xFFFFFFFF >= 5
    addi x20, x0, 100        # skipped
gbgeut:
    bge  x5, x8, gbgeun      # -> bgeu, not taken: 5 >= 0xFFFFFFFF is false
    addi x21, x0, 1          # executed on fall-through
gbgeun:

    addi x28, x0, 3          # loop counter
    addi x29, x0, 0          # accumulator
gloop:
    add  x29, x29, x28       # acc += counter
    addi x28, x28, -1        # counter--
    bne  x28, x0, gloop      # backward branch, taken until counter == 0

    jal  x1, gsub            # call: link return address in x1
    addi x30, x0, 7          # executed after the jalr return
    jal  x0, gend            # jump over the subroutine body
gsub:
    addi x31, x0, 9          # subroutine body
    jalr x0, x1, 0           # register-indirect jump: return to caller
gend:
    addi x24, x0, 42         # final marker
`;

// The unsigned branches to synthesize, keyed by their (unique) target label.
// funct3: bltu = 110, bgeu = 111 (blt = 100, bge = 101 before the flip).
const CONTROL_FLOW_BRANCH_SYNTH: Array<{ target: string; mnemonic: string; funct3: string }> = [
  { target: "gbltut", mnemonic: "bltu", funct3: "110" },
  { target: "gbltun", mnemonic: "bltu", funct3: "110" },
  { target: "gbgeut", mnemonic: "bgeu", funct3: "111" },
  { target: "gbgeun", mnemonic: "bgeu", funct3: "111" },
];

// Arithmetic net: every R-type ALU op the ICPU deepening can disturb —
// add/sub/and/or/xor, the three shifts (sll/srl/sra), slt/sltu in both
// orderings, and the RV32M mul/div/rem including the spec-defined divide- and
// remainder-by-zero results. Operands are small constants (no lui/auipc); the
// divide/remainder-by-zero cases use x0 as the zero divisor.
//
// The shipped parser rejects `sltu`/`mul`/`div`/`rem` (the same generated-parser
// lag), so those ten instructions are written as parser-accepted R-type
// placeholders — slt/add/xor/or — with a unique `rd`, and rewritten to the
// intended op by flipping `funct3`/`funct7` in `synthesizeRTypeOps`. Both CPUs
// decode the ALU op from `funct3`/`funct7`, so this exercises the real op paths.
const ARITHMETIC_PROGRAM = `
main:
    addi x5,  x0, 12         # a = 12
    addi x6,  x0, 5          # b = 5
    addi x7,  x0, -3         # c = -3 (0xFFFFFFFD)
    addi x8,  x0, 2          # shift amount

    add  x10, x5, x6         # 12 + 5
    sub  x11, x5, x6         # 12 - 5
    and  x12, x5, x6         # 12 & 5
    or   x13, x5, x6         # 12 | 5
    xor  x14, x5, x6         # 12 ^ 5
    sll  x15, x5, x8         # 12 << 2
    srl  x16, x5, x8         # 12 >> 2 (logical)
    sra  x17, x7, x8         # -3 >> 2 (arithmetic)
    slt  x18, x7, x6         # (-3 < 5) signed
    slt  x19, x6, x7         # (5 < -3) signed
    slt  x20, x6, x7         # -> sltu: (5 < 0xFFFFFFFD) unsigned
    slt  x21, x7, x6         # -> sltu: (0xFFFFFFFD < 5) unsigned
    add  x22, x5, x6         # -> mul: 12 * 5
    add  x23, x7, x6         # -> mul: -3 * 5
    xor  x24, x5, x6         # -> div: 12 / 5 (signed)
    xor  x25, x7, x6         # -> div: -3 / 5 (signed, truncates toward zero)
    or   x26, x5, x6         # -> rem: 12 % 5
    or   x27, x7, x6         # -> rem: -3 % 5
    xor  x28, x5, x0         # -> div: 12 / 0 -> 0xFFFFFFFF (spec-defined)
    or   x29, x5, x0         # -> rem: 12 % 0 -> 12 (spec-defined: dividend)
`;

// The R-type ops to synthesize, keyed by their (unique) destination register.
// funct3/funct7 per the RV32I/RV32M encoding: sltu = 011/0000000,
// mul = 000/0000001, div = 100/0000001, rem = 110/0000001.
const ARITHMETIC_RTYPE_SYNTH: Array<{
  rd: string;
  mnemonic: string;
  funct3: string;
  funct7: string;
}> = [
  { rd: "x20", mnemonic: "sltu", funct3: "011", funct7: "0000000" },
  { rd: "x21", mnemonic: "sltu", funct3: "011", funct7: "0000000" },
  { rd: "x22", mnemonic: "mul", funct3: "000", funct7: "0000001" },
  { rd: "x23", mnemonic: "mul", funct3: "000", funct7: "0000001" },
  { rd: "x24", mnemonic: "div", funct3: "100", funct7: "0000001" },
  { rd: "x25", mnemonic: "div", funct3: "100", funct7: "0000001" },
  { rd: "x26", mnemonic: "rem", funct3: "110", funct7: "0000001" },
  { rd: "x27", mnemonic: "rem", funct3: "110", funct7: "0000001" },
  { rd: "x28", mnemonic: "div", funct3: "100", funct7: "0000001" },
  { rd: "x29", mnemonic: "rem", funct3: "110", funct7: "0000001" },
];

interface StateSnapshot {
  registers: string[];
  dataMemory: string[];
}

function assemble() {
  const ir = assembleSource(PROGRAM);
  synthesizeUnsignedLoads(ir);
  return ir;
}

/** Assembles a program, throwing on any assembler error. */
function assembleSource(program: string) {
  const result = compile(program, "golden.test.asm");
  if (!result.success || !result.ir) {
    throw new Error(`Assembly failed: ${result.info} ${JSON.stringify(result.extra)}`);
  }
  return result.ir;
}

function assembleControlFlow() {
  const ir = assembleSource(CONTROL_FLOW_PROGRAM);
  synthesizeUnsignedBranches(ir);
  return ir;
}

function assembleArithmetic() {
  const ir = assembleSource(ARITHMETIC_PROGRAM);
  synthesizeRTypeOps(ir);
  return ir;
}

/**
 * Finds the single source instruction matching `predicate`, throwing if it does
 * not match exactly one node. Used to target the synthesis rewrites below: each
 * placeholder must resolve to one node, so a program edit that drops or renames
 * it fails loudly instead of silently dropping coverage. `describe` names the
 * key being matched, for the error message.
 */
function findOnlyInstruction(
  ir: { instructions: any[] },
  describe: string,
  predicate: (node: any) => boolean
): any {
  const matches = ir.instructions.filter(
    (n) => n?.kind === "SrcInstruction" && predicate(n)
  );
  if (matches.length !== 1) {
    throw new Error(`synthesize: expected 1 node for ${describe}, found ${matches.length}`);
  }
  return matches[0];
}

/**
 * The last comma-separated token of a branch's `asm` string is its target
 * label (e.g. `blt x5, x8, gbltut` -> "gbltut"). Each synthesized branch
 * targets a unique label, so this is a stable key for the rewrite.
 */
function branchTarget(node: any): string {
  return node.asm.split(",").pop().trim();
}

/**
 * Rewrites the `blt`/`bge` placeholders that stand in for `bltu`/`bgeu` (which
 * the shipped parser cannot assemble) into their unsigned form by flipping
 * `funct3`. Matched by target label.
 */
function synthesizeUnsignedBranches(ir: { instructions: any[] }): void {
  for (const rw of CONTROL_FLOW_BRANCH_SYNTH) {
    const node = findOnlyInstruction(
      ir,
      `branch to '${rw.target}'`,
      (n) => DecodedInstruction.from(n).type() === "B" && branchTarget(n) === rw.target
    );
    node.encoding.funct3 = rw.funct3;
    node.instruction = rw.mnemonic;
  }
}

/**
 * Rewrites the parser-accepted R-type placeholders (slt/add/xor/or) into the
 * `sltu`/`mul`/`div`/`rem` ops the shipped parser cannot assemble, by flipping
 * `funct3`/`funct7`. Matched by destination register.
 */
function synthesizeRTypeOps(ir: { instructions: any[] }): void {
  for (const rw of ARITHMETIC_RTYPE_SYNTH) {
    const node = findOnlyInstruction(
      ir,
      `R-type with rd '${rw.rd}'`,
      (n) => DecodedInstruction.from(n).type() === "R" && n.rd?.regeq === rw.rd
    );
    node.encoding.funct3 = rw.funct3;
    node.encoding.funct7 = rw.funct7;
    node.instruction = rw.mnemonic;
  }
}

/**
 * Turns the `lb x13` / `lh x15` placeholders into `lbu` / `lhu` by flipping
 * `funct3` (000 -> 100 byte-unsigned, 001 -> 101 half-unsigned). The parser
 * cannot emit these mnemonics directly; the CPUs classify load width and
 * signedness from `funct3`, so this yields genuine unsigned-load nodes.
 */
function synthesizeUnsignedLoads(ir: { instructions: any[] }): void {
  for (const node of ir.instructions) {
    if (node?.kind !== "SrcInstruction" || !DecodedInstruction.from(node).isILoad()) {
      continue;
    }
    if (node.rd?.regeq === "x13") {
      node.encoding.funct3 = "100";
      node.instruction = "lbu";
    } else if (node.rd?.regeq === "x15") {
      node.encoding.funct3 = "101";
      node.instruction = "lhu";
    }
  }
}

function snapshot(cpu: ICPU): StateSnapshot {
  return {
    registers: cpu.getRegisterFile().getRegisterData(),
    dataMemory: cpu.getDataMemory().getAvailableMemory(),
  };
}

/**
 * Headless monocycle driver. Replicates the essential control flow of
 * `TextSimulator.step()` without the VS Code host: `cycle()` already performs
 * register writes and memory loads internally, so the driver only has to
 * commit stores to memory and advance the PC. `buMux.result` carries the
 * next-PC byte address for every instruction type (sequential fall-through or
 * branch/jump target), so a single `jumpToInstruction` drives all control
 * flow without importing instruction predicates.
 */
function runMonocycle(cpu: SCCPU): void {
  let steps = 0;
  while (!cpu.finished()) {
    if (++steps > MAX_STEPS) {
      throw new Error("Monocycle program did not terminate");
    }
    const result = cpu.cycle();
    const instruction = cpu.currentInstruction();
    if (DecodedInstruction.from(instruction).writesMemory()) {
      commitStore(cpu, result);
    }
    cpu.jumpToInstruction(result.buMux.result);
  }
}

/**
 * Faithful copy of `TextSimulator.writeResult`'s memory commit: the full
 * 32-bit word is written little-endian for every store width. Preserved
 * verbatim so the golden captures current behaviour, quirks included.
 */
function commitStore(cpu: SCCPU, result: SCCPUResult): void {
  let dataWr = result.dm.dataWr;
  if (dataWr.length < 32) {
    dataWr = dataWr.padStart(32, "0");
  }
  const address = parseInt(result.dm.address, 2);
  const chunks = dataWr.match(/.{1,8}/g) as string[];
  cpu.getDataMemory().write(chunks.reverse(), address);
}

/** Headless pipeline driver: the pipeline commits stores/loads and register
 * writes internally, so it only needs to be clocked until it drains. */
function runPipeline(cpu: PipelineCPU): void {
  let steps = 0;
  while (!cpu.finished()) {
    if (++steps > MAX_STEPS) {
      throw new Error("Pipeline program did not terminate");
    }
    cpu.cycle();
  }
}

/** Builds a fresh monocycle CPU from assembled IR, run to completion. */
function monocycleFrom(ir: ReturnType<typeof assembleSource>): SCCPU {
  const cpu = new SCCPU(
    ir.instructions,
    ir.programMemory,
    ir.writableMemory,
    ir.readOnlyMemory,
    MEMORY_SIZE
  );
  runMonocycle(cpu);
  return cpu;
}

/** Builds a fresh pipeline CPU from assembled IR, run to completion. */
function pipelineFrom(ir: ReturnType<typeof assembleSource>): PipelineCPU {
  const cpu = new PipelineCPU(
    ir.instructions,
    ir.programMemory,
    ir.writableMemory,
    ir.readOnlyMemory,
    MEMORY_SIZE
  );
  runPipeline(cpu);
  return cpu;
}

describe("golden-output integration net", () => {
  it("monocycle CPU matches the captured register file and data memory", () => {
    expect(snapshot(monocycleFrom(assemble()))).toMatchSnapshot();
  });

  it("pipeline CPU matches the captured register file and data memory", () => {
    expect(snapshot(pipelineFrom(assemble()))).toMatchSnapshot();
  });
});

describe("golden-output control-flow net", () => {
  it("monocycle CPU matches the captured register file and data memory", () => {
    expect(snapshot(monocycleFrom(assembleControlFlow()))).toMatchSnapshot();
  });

  it("pipeline CPU matches the captured register file and data memory", () => {
    expect(snapshot(pipelineFrom(assembleControlFlow()))).toMatchSnapshot();
  });
});

describe("golden-output arithmetic net", () => {
  it("monocycle CPU matches the captured register file and data memory", () => {
    expect(snapshot(monocycleFrom(assembleArithmetic()))).toMatchSnapshot();
  });

  it("pipeline CPU matches the captured register file and data memory", () => {
    expect(snapshot(pipelineFrom(assembleArithmetic()))).toMatchSnapshot();
  });
});
