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

interface StateSnapshot {
  registers: string[];
  dataMemory: string[];
}

function assemble() {
  const result = compile(PROGRAM, "golden.test.asm");
  if (!result.success || !result.ir) {
    throw new Error(`Assembly failed: ${result.info} ${JSON.stringify(result.extra)}`);
  }
  synthesizeUnsignedLoads(result.ir);
  return result.ir;
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

describe("golden-output integration net", () => {
  it("monocycle CPU matches the captured register file and data memory", () => {
    const ir = assemble();
    const cpu = new SCCPU(
      ir.instructions,
      ir.programMemory,
      ir.writableMemory,
      ir.readOnlyMemory,
      MEMORY_SIZE
    );
    runMonocycle(cpu);
    expect(snapshot(cpu)).toMatchSnapshot();
  });

  it("pipeline CPU matches the captured register file and data memory", () => {
    const ir = assemble();
    const cpu = new PipelineCPU(
      ir.instructions,
      ir.programMemory,
      ir.writableMemory,
      ir.readOnlyMemory,
      MEMORY_SIZE
    );
    runPipeline(cpu);
    expect(snapshot(cpu)).toMatchSnapshot();
  });
});
