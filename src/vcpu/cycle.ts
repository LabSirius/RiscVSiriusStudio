import { DecodedInstruction } from "./instruction";

/**
 * The Cycle effect: the CPU-independent, per-clock observation of what one
 * `cycle()` committed (ADR-0002). It is the sole return of `ICPU.cycle()`, read
 * by the orchestration layer to *notify the UI* — never to *make state advance*,
 * which the CPU has already done internally.
 *
 * A clock commits at most one register write and at most one memory access, and
 * always resolves a control transfer (the next program counter). Each populated
 * field is tagged with the `DecodedInstruction` that produced it — the one
 * instruction on the single-cycle CPU, or the specific pipeline stage's
 * instruction (register write from WB, memory access from MEM) on the pipeline.
 *
 * The datapath render shape (`MonocycleWires` / `PipelineStages`) is deliberately
 * absent: it is a per-CPU render concern reached through a concrete CPU
 * reference, off the shared contract (ADR-0003).
 */
export interface CycleEffect {
  /** The register file write this clock committed, if any. */
  registerWrite?: RegisterWrite;
  /** The data-memory access this clock committed, if any. */
  memoryAccess?: MemoryAccessEffect;
  /** The control transfer this clock resolved (present for every real clock). */
  controlTransfer?: ControlTransfer;
}

/** A committed register-file write. */
export interface RegisterWrite {
  /** Destination register name, e.g. "x5". */
  register: string;
  /** The 32-bit value written, as a bit-string. */
  value: string;
  /** The instruction that produced the write. */
  instruction: DecodedInstruction;
}

/** A committed data-memory access (a load's read or a store's write). */
export interface MemoryAccessEffect {
  /** Byte address touched. */
  address: number;
  /** Number of bytes accessed (1, 2 or 4). */
  bytes: number;
  /** Whether the access reads (load) or writes (store) memory. */
  kind: "read" | "write";
  /** The value read (load) or written (store), as a 32-bit bit-string. */
  value: string;
  /** The instruction that produced the access. */
  instruction: DecodedInstruction;
}

/** The next-PC resolution for the clock. */
export interface ControlTransfer {
  /** Byte address of the next program counter. */
  nextPc: number;
  /** True when a branch/jump was taken (as opposed to sequential fall-through). */
  taken: boolean;
  /** The branch/jump that produced a taken transfer, when one did. */
  instruction?: DecodedInstruction;
}
