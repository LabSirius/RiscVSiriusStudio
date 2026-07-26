# Domain Glossary — RiscVSiriusStudio

A RISC-V assembly simulator packaged as a VS Code extension, for teaching computer architecture. This file is the project's ubiquitous language: when code, issues, or tests name a domain concept, use the term as defined here.

## Instruction model

- **DecodedInstruction** — a typed, read-only view wrapping one **Raw IR node**. The single source of truth for instruction facts (`usesRs1`, `usesRs2`, `usesRd`, `readsMemory`, `writesRegister`, `branchesOrJumps`, …) and for memory-access shape (`memoryAccess(): { bytes: 1 | 2 | 4, signed: boolean } | null`, plus a pure `extend(bits)` helper for sign/zero extension of loaded values). Constructed via `DecodedInstruction.from(rawNode)`. Lives in `src/vcpu/instruction.ts`. Replaces the stringly-typed predicates formerly scattered in `src/utilities/instructions.ts`. It **wraps — does not replace** — the parser/IR output; the assembler and `InternalRepresentation` are untouched.

- **Raw IR node** — the untyped (`any`) instruction object emitted by the assembler (`src/utilities/riscvc.ts`, itself wrapping the peggy-generated `riscv.ts` parser). Carries `.type` (`R/I/S/B/U/J`), `.opcode` (bitstring), `.encoding.funct3`/`.encoding.funct7`, `.rs1/.rs2/.rd.regeq` (register names), `.instruction` (mnemonic string), `.inst` (numeric PC), `.asm` (source text). `DecodedInstruction` reads through it lazily. Note the name clash: the raw node's `.instruction` field is the *mnemonic*, not a DecodedInstruction — hence the fuller class name.

- **Memory-access shape** — the `{ bytes, signed }` classification of a load/store, derived once from `funct3`. Replaces three divergent `switch(funct3)` decoders (previously in `singlecycle.ts`, `pipeline.ts`, `Simulator.ts`). The CPU still performs the actual `DataMemory.read/write`; `DecodedInstruction` owns only the classification and the pure `extend` of loaded bits.
