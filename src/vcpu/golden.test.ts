/* eslint-disable @typescript-eslint/naming-convention */
import { describe, it, expect } from "vitest";
import { compile } from "../utilities/riscvc";
import { SCCPU } from "./singlecycle";
import { PipelineCPU } from "./pipeline/pipeline";
import type { ICPU } from "./interface";

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
 * The three programs exercise every load/store form (`lb`, `lbu`, `lh`,
 * `lhu`, `lw`, `sb`, `sh`, `sw`), every branch condition (`beq`/`bne`/`blt`/
 * `bge`/`bltu`/`bgeu`) in both taken and not-taken outcomes, jumps (`jal`,
 * `jalr`), and every R-type ALU op (add/sub/and/or/xor, the three shifts,
 * slt/sltu, and the RV32M mul/div/rem) — the code most prone to silent
 * breakage during the migration.
 *
 * All mnemonics are assembled directly: the shipped parser (`riscv.ts`,
 * regenerated from `riscv.peg`) accepts the full instruction set. Earlier
 * revisions synthesized `lbu`/`lhu`/`bltu`/`bgeu`/`sltu`/`mul`/`div`/`rem` by
 * flipping `funct3`/`funct7` on parser-accepted placeholders, working around a
 * stale generated parser; that gap is closed, so the workaround is gone.
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
    lw   x11, 0(x0)          # load word          -> 0xFFFFFFFF
    lb   x12, 0(x0)          # load byte          -> sign-extended 0xFF = -1
    lbu  x13, 0(x0)          # load byte unsigned -> 0x000000FF = 255
    lh   x14, 0(x0)          # load half          -> sign-ext 0xFFFF = 0xFFFFFFFF
    lhu  x15, 0(x0)          # load half unsigned -> 0x0000FFFF
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
// from the snapshot — a mis-taken branch would leak it in. No lui/auipc appears
// (0xFFFFFFFF is materialized with `addi x8, x0, -1`).
const CONTROL_FLOW_PROGRAM = `
main:
    addi x5,  x0, 5          # a = 5
    addi x6,  x0, 5          # b = 5  (== a)
    addi x7,  x0, 10         # c = 10 (> a, both signed and unsigned)
    addi x8,  x0, -1         # d = 0xFFFFFFFF (signed -1, unsigned max)

    beq  x5, x6, beqT        # taken: 5 == 5
    addi x10, x0, 100        # skipped
beqT:
    beq  x5, x7, beqN        # not taken: 5 != 10
    addi x11, x0, 1          # executed on fall-through
beqN:

    bne  x5, x7, bneT        # taken: 5 != 10
    addi x12, x0, 100        # skipped
bneT:
    bne  x5, x6, bneN        # not taken: 5 == 5
    addi x13, x0, 1          # executed on fall-through
bneN:

    blt  x8, x5, bltT        # taken (signed): -1 < 5
    addi x14, x0, 100        # skipped
bltT:
    blt  x7, x5, bltN        # not taken (signed): 10 < 5 is false
    addi x15, x0, 1          # executed on fall-through
bltN:

    bge  x5, x6, bgeT        # taken (signed): 5 >= 5
    addi x16, x0, 100        # skipped
bgeT:
    bge  x8, x5, bgeN        # not taken (signed): -1 >= 5 is false
    addi x17, x0, 1          # executed on fall-through
bgeN:

    bltu x5, x8, bltuT       # taken (unsigned): 5 < 0xFFFFFFFF
    addi x18, x0, 100        # skipped
bltuT:
    bltu x8, x5, bltuN       # not taken: 0xFFFFFFFF < 5 is false
    addi x19, x0, 1          # executed on fall-through
bltuN:

    bgeu x8, x5, bgeuT       # taken (unsigned): 0xFFFFFFFF >= 5
    addi x20, x0, 100        # skipped
bgeuT:
    bgeu x5, x8, bgeuN       # not taken: 5 >= 0xFFFFFFFF is false
    addi x21, x0, 1          # executed on fall-through
bgeuN:

    addi x28, x0, 3          # loop counter
    addi x29, x0, 0          # accumulator
loop:
    add  x29, x29, x28       # acc += counter
    addi x28, x28, -1        # counter--
    bne  x28, x0, loop       # backward branch, taken until counter == 0

    jal  x1, subr            # call: link return address in x1
    addi x30, x0, 7          # executed after the jalr return
    jal  x0, end             # jump over the subroutine body
subr:
    addi x31, x0, 9          # subroutine body
    jalr x0, x1, 0           # register-indirect jump: return to caller
end:
    addi x24, x0, 42         # final marker
`;

// Arithmetic net: every R-type ALU op the ICPU deepening can disturb —
// add/sub/and/or/xor, the three shifts (sll/srl/sra), slt/sltu in both
// orderings, and the RV32M mul/div/rem including the spec-defined divide- and
// remainder-by-zero results. Operands are small constants (no lui/auipc); the
// divide/remainder-by-zero cases use x0 as the zero divisor.
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
    sltu x20, x6, x7         # (5 < 0xFFFFFFFD) unsigned
    sltu x21, x7, x6         # (0xFFFFFFFD < 5) unsigned
    mul  x22, x5, x6         # 12 * 5
    mul  x23, x7, x6         # -3 * 5
    div  x24, x5, x6         # 12 / 5 (signed)
    div  x25, x7, x6         # -3 / 5 (signed, truncates toward zero)
    rem  x26, x5, x6         # 12 % 5
    rem  x27, x7, x6         # -3 % 5
    div  x28, x5, x0         # 12 / 0 -> 0xFFFFFFFF (spec-defined)
    rem  x29, x5, x0         # 12 % 0 -> 12 (spec-defined: dividend)
`;

interface StateSnapshot {
  registers: string[];
  dataMemory: string[];
}

/** Assembles a program, throwing on any assembler error. */
function assembleSource(program: string) {
  const result = compile(program, "golden.test.asm");
  if (!result.success || !result.ir) {
    throw new Error(`Assembly failed: ${result.info} ${JSON.stringify(result.extra)}`);
  }
  return result.ir;
}

function snapshot(cpu: ICPU): StateSnapshot {
  return {
    registers: cpu.getRegisterFile().getRegisterData(),
    dataMemory: cpu.getDataMemory().getAvailableMemory(),
  };
}

/**
 * Headless monocycle driver. `SCCPU.cycle()` is self-committing — it advances
 * the register file, data memory (stores included) and program counter, and
 * detects halt — so the driver just clocks it to completion, identical to the
 * pipeline driver below and no longer needing to know which CPU it holds.
 */
function runMonocycle(cpu: SCCPU): void {
  let steps = 0;
  while (!cpu.finished()) {
    if (++steps > MAX_STEPS) {
      throw new Error("Monocycle program did not terminate");
    }
    cpu.cycle();
  }
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
    expect(snapshot(monocycleFrom(assembleSource(PROGRAM)))).toMatchSnapshot();
  });

  it("pipeline CPU matches the captured register file and data memory", () => {
    expect(snapshot(pipelineFrom(assembleSource(PROGRAM)))).toMatchSnapshot();
  });
});

describe("golden-output control-flow net", () => {
  it("monocycle CPU matches the captured register file and data memory", () => {
    expect(snapshot(monocycleFrom(assembleSource(CONTROL_FLOW_PROGRAM)))).toMatchSnapshot();
  });

  it("pipeline CPU matches the captured register file and data memory", () => {
    expect(snapshot(pipelineFrom(assembleSource(CONTROL_FLOW_PROGRAM)))).toMatchSnapshot();
  });
});

describe("golden-output arithmetic net", () => {
  it("monocycle CPU matches the captured register file and data memory", () => {
    expect(snapshot(monocycleFrom(assembleSource(ARITHMETIC_PROGRAM)))).toMatchSnapshot();
  });

  it("pipeline CPU matches the captured register file and data memory", () => {
    expect(snapshot(pipelineFrom(assembleSource(ARITHMETIC_PROGRAM)))).toMatchSnapshot();
  });
});
