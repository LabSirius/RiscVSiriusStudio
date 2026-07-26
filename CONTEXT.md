# Domain Glossary — RiscVSiriusStudio

A RISC-V assembly simulator packaged as a VS Code extension, for teaching computer architecture. This file is the project's ubiquitous language: when code, issues, or tests name a domain concept, use the term as defined here.

## Instruction model

- **DecodedInstruction** — a typed, read-only view wrapping one **Raw IR node**. The single source of truth for instruction facts (`usesRs1`, `usesRs2`, `usesRd`, `readsMemory`, `writesRegister`, `branchesOrJumps`, the write-back-value origin `writesComputedResult`/`writesLoadedValue`/`writesReturnAddress`, …) and for memory-access shape (`memoryAccess(): { bytes: 1 | 2 | 4, signed: boolean } | null`, plus a pure `extend(bits)` helper for sign/zero extension of loaded values). Constructed via `DecodedInstruction.from(rawNode)`. Lives in `src/vcpu/instruction.ts`. Replaces the stringly-typed predicates formerly scattered in `src/utilities/instructions.ts`. It **wraps — does not replace** — the parser/IR output; the assembler and `InternalRepresentation` are untouched. **CPU-independent**: it holds only **ISA facts** (see below) — never a **Control signal**. Every CPU model reads the same `DecodedInstruction`. (Seam recorded in `docs/adr/0001-decodedinstruction-is-cpu-independent.md`.)

- **Raw IR node** — the untyped (`any`) instruction object emitted by the assembler (`src/utilities/riscvc.ts`, itself wrapping the peggy-generated `riscv.ts` parser). Carries `.type` (`R/I/S/B/U/J`), `.opcode` (bitstring), `.encoding.funct3`/`.encoding.funct7`, `.rs1/.rs2/.rd.regeq` (register names), `.instruction` (mnemonic string), `.inst` (numeric PC), `.asm` (source text). `DecodedInstruction` reads through it lazily. Note the name clash: the raw node's `.instruction` field is the *mnemonic*, not a DecodedInstruction — hence the fuller class name.

- **Memory-access shape** — the `{ bytes, signed }` classification of a load/store, derived once from `funct3`. Replaces three divergent `switch(funct3)` decoders (previously in `singlecycle.ts`, `pipeline.ts`, `Simulator.ts`). The CPU still performs the actual `DataMemory.read/write`; `DecodedInstruction` owns only the classification and the pure `extend` of loaded bits.

## Instruction facts vs control signals

- **ISA fact** — a property of a RISC-V instruction that is true regardless of the CPU that runs it: its type, register usage, funct fields, memory-access shape, extension rule, and the origin of its write-back value. ISA facts are the *only* thing `DecodedInstruction` exposes, and every CPU model shares them.
  _Avoid_: "decode result", "control info".

- **Control signal** — a value that drives a *specific* datapath's wires and muxes: `alu_op`, `imm_src`, `ru_data_wr_src`, `br_op` (the `ControlSignals` shape in `src/vcpu/components/decoder.ts`). Datapath-specific, so it lives in a **ControlUnit**, never in `DecodedInstruction`. A different microarchitecture (e.g. two ALUs) gets its own ControlUnit reading the same ISA facts.
  _Avoid_: "instruction fact", using an `alu_op`/mux string as though it were ISA.

- **ControlUnit** — the per-microarchitecture translator from `DecodedInstruction` (ISA facts) to a `ControlSignals` set (datapath control). One per datapath: the single-cycle and pipeline CPUs share one because they share a functional datapath.
