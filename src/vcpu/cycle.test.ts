/* eslint-disable @typescript-eslint/naming-convention */
import { describe, it, expect } from "vitest";
import { compile } from "../utilities/riscvc";
import { SCCPU } from "./singlecycle";
import { PipelineCPU } from "./pipeline/pipeline";
import type { ICPU } from "./interface";
import type { CycleEffect } from "./cycle";

/**
 * Cycle-effect net for ADR-0002. A small program is assembled and clocked
 * headless through BOTH CPU models; each clock's Cycle effect is captured and
 * flattened to a plain fact row (mirroring `instruction.test.ts`), then the
 * per-clock stream is asserted against explicit expectations.
 *
 * The program commits one of each effect kind at a known point:
 *   - `addi x5, 42`   — a register write (computed result)
 *   - `sw x5, 0(x0)`  — a memory write
 *   - `lw x6, 0(x0)`  — a memory read AND a register write
 *   - `beq x5, x5`    — a taken control transfer (5 == 5)
 *   - `addi x7, 99`   — skipped by the taken branch (must never commit)
 *   - `addi x8, 7`    — the branch target: a register write
 *
 * Instructions sit at byte addresses 0,4,8,…; `done:` is index 5 → address 20.
 */

const MEMORY_SIZE = 128;
const MAX_STEPS = 100;

const PROGRAM = `
main:
    addi x5, x0, 42         # register write: x5 = 42
    sw   x5, 0(x0)          # memory write:  mem[0..3] = 42
    lw   x6, 0(x0)          # memory read + register write: x6 = 42
    beq  x5, x5, done       # control transfer taken (5 == 5)
    addi x7, x0, 99         # skipped when the branch is taken
done:
    addi x8, x0, 7          # register write: x8 = 7
`;

/** A populated register-write effect, flattened for assertion. */
interface RegFact {
  register: string;
  value: number;
  mnemonic: string;
}
/** A populated memory-access effect, flattened for assertion. */
interface MemFact {
  kind: "read" | "write";
  address: number;
  bytes: number;
  value: number;
  mnemonic: string;
}
/** A control-transfer effect, flattened for assertion. */
interface ControlFact {
  nextPc: number;
  taken: boolean;
  mnemonic: string | null;
}

interface EffectFacts {
  reg: RegFact | null;
  mem: MemFact | null;
  control: ControlFact | null;
}

function factsOf(e: CycleEffect): EffectFacts {
  return {
    reg: e.registerWrite
      ? {
          register: e.registerWrite.register,
          value: parseInt(e.registerWrite.value, 2),
          mnemonic: e.registerWrite.instruction.mnemonic(),
        }
      : null,
    mem: e.memoryAccess
      ? {
          kind: e.memoryAccess.kind,
          address: e.memoryAccess.address,
          bytes: e.memoryAccess.bytes,
          value: parseInt(e.memoryAccess.value, 2),
          mnemonic: e.memoryAccess.instruction.mnemonic(),
        }
      : null,
    control: e.controlTransfer
      ? {
          nextPc: e.controlTransfer.nextPc,
          taken: e.controlTransfer.taken,
          mnemonic: e.controlTransfer.instruction?.mnemonic() ?? null,
        }
      : null,
  };
}

function assembleSource(program: string) {
  const result = compile(program, "cycle.test.asm");
  if (!result.success || !result.ir) {
    throw new Error(`Assembly failed: ${result.info} ${JSON.stringify(result.extra)}`);
  }
  return result.ir;
}

/** Clocks a CPU to completion, capturing the Cycle effect of every clock. */
function effectStream(cpu: ICPU): CycleEffect[] {
  const effects: CycleEffect[] = [];
  let steps = 0;
  while (!cpu.finished()) {
    if (++steps > MAX_STEPS) {
      throw new Error("program did not terminate");
    }
    effects.push(cpu.cycle());
  }
  return effects;
}

function cpuFrom(kind: "monocycle" | "pipeline"): ICPU {
  const ir = assembleSource(PROGRAM);
  const Ctor = kind === "monocycle" ? SCCPU : PipelineCPU;
  return new Ctor(
    ir.instructions,
    ir.programMemory,
    ir.writableMemory,
    ir.readOnlyMemory,
    MEMORY_SIZE
  );
}

describe("single-cycle Cycle-effect stream", () => {
  it("commits one instruction's full effect per clock", () => {
    const stream = effectStream(cpuFrom("monocycle")).map(factsOf);
    expect(stream).toEqual([
      // addi x5, 42
      { reg: { register: "x5", value: 42, mnemonic: "addi" }, mem: null, control: { nextPc: 4, taken: false, mnemonic: "addi" } },
      // sw x5, 0(x0)
      { reg: null, mem: { kind: "write", address: 0, bytes: 4, value: 42, mnemonic: "sw" }, control: { nextPc: 8, taken: false, mnemonic: "sw" } },
      // lw x6, 0(x0)  — reads memory AND writes the loaded value to x6
      { reg: { register: "x6", value: 42, mnemonic: "lw" }, mem: { kind: "read", address: 0, bytes: 4, value: 42, mnemonic: "lw" }, control: { nextPc: 12, taken: false, mnemonic: "lw" } },
      // beq x5, x5, done — taken to address 20
      { reg: null, mem: null, control: { nextPc: 20, taken: true, mnemonic: "beq" } },
      // addi x8, 7  (x7 at address 16 was skipped)
      { reg: { register: "x8", value: 7, mnemonic: "addi" }, mem: null, control: { nextPc: 24, taken: false, mnemonic: "addi" } },
    ]);
  });
});

describe("pipeline Cycle-effect stream", () => {
  const stream = effectStream(cpuFrom("pipeline")).map(factsOf);

  it("commits register writes in program order from the WB stage", () => {
    expect(stream.filter((f) => f.reg).map((f) => f.reg)).toEqual([
      { register: "x5", value: 42, mnemonic: "addi" },
      { register: "x6", value: 42, mnemonic: "lw" },
      { register: "x8", value: 7, mnemonic: "addi" },
    ]);
  });

  it("commits the store then the load from the MEM stage", () => {
    expect(stream.filter((f) => f.mem).map((f) => f.mem)).toEqual([
      { kind: "write", address: 0, bytes: 4, value: 42, mnemonic: "sw" },
      { kind: "read", address: 0, bytes: 4, value: 42, mnemonic: "lw" },
    ]);
  });

  it("resolves exactly one taken control transfer, from the branch", () => {
    const taken = stream.filter((f) => f.control?.taken).map((f) => f.control);
    expect(taken).toEqual([{ nextPc: 20, taken: true, mnemonic: "beq" }]);
  });

  it("never commits the branch-skipped x7 write", () => {
    expect(stream.some((f) => f.reg?.register === "x7")).toBe(false);
  });
});
