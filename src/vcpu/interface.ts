// The CPU stepping seam: the shared engine contract every CPU model (single-cycle,
// pipeline) implements. It exposes *stepping and architectural state* — one clock
// per cycle() — and nothing datapath-shaped. The Datapath view (MonocycleWires /
// PipelineStages) is deliberately absent: it is a per-CPU render concern reached
// through a concrete CPU reference, never through this shared contract (ADR-0003).
// See CONTEXT.md → "CPU stepping seam (ICPU)".
import { CycleEffect } from "./cycle";
import { DecodedInstruction } from "./instruction";
import { RegistersFile, DataMemory } from "./components/components";

/** A four-byte data-memory row as posted by the memory-table webview. */
export interface MemoryRow {
  value0: string;
  value1: string;
  value2: string;
  value3: string;
}

export interface ICPU {
  /** Advances one clock (self-committing) and returns the Cycle effect (ADR-0002). */
  cycle(): CycleEffect;
  getPC(): number;
  finished(): boolean;
  /**
   * The instruction whose source line the editor highlights this clock:
   * single-cycle → the executing instruction; pipeline → the just-fetched
   * (IF/ID) instruction.
   */
  highlightedInstruction(): DecodedInstruction;
  getRegisterFile(): RegistersFile;
  getDataMemory(): DataMemory;
  getProgram(): readonly DecodedInstruction[];
  replaceDataMemory(newMemory: MemoryRow[]): void;
  replaceRegisters(newRegisters: string[]): void;
}
