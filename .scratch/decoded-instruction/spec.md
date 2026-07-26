# Spec: DecodedInstruction — a deep instruction model

Status: ready-for-agent

## Problem Statement

The knowledge about "what a RISC-V instruction is" is scattered across the codebase as ~30 stringly-typed free functions in `src/utilities/instructions.ts` (`usesRs1`, `readsDM`, `writesRU`, `getRs1`, `getFunct3`, `opcodeToType`, `isIArithmetic`, …). Every consumer — the ControlUnit decoder, both CPU models, and the Simulator orchestration layer — re-derives instruction facts from raw strings (`"000"`, `"R"`, opcode bitstrings). Worst of all, the load/store **memory-access shape** (how many bytes an access touches, and whether the loaded value is sign- or zero-extended) is decoded three separate times, in three subtly different `switch(funct3)` blocks, in three different layers. These copies can drift apart silently: nothing ties them together, and the repo has **zero tests**, so a divergence produces a wrong answer with no signal.

For a maintainer or an AI agent coming back to this code, understanding one instruction concept means bouncing between a grab-bag of predicates and re-reading raw-string decoding at every call site. Nothing is verified.

## Solution

Introduce a single deep module — `DecodedInstruction` — that is the one place instruction facts live. It wraps a raw IR instruction node and exposes a narrow, typed interface: query methods for instruction facts, and a single memory-access classification (`{ bytes, signed }`) plus a pure sign/zero `extend` helper. Every consumer asks `DecodedInstruction` instead of re-parsing strings. The three divergent byte-width decoders collapse into one.

Alongside it, the repo gains its **first tests**: a unit fact-table pinning the instruction contract, and a golden-output integration test that snapshots CPU state so the migration can be proven not to change behaviour.

From the user's perspective (the developer maintaining the simulator): instruction facts have one home, one interface, and a test suite; adding or correcting instruction behaviour happens in one module with immediate feedback, instead of hunting three copies by eye.

## User Stories

1. As a simulator maintainer, I want all instruction facts behind one `DecodedInstruction` interface, so that I stop re-deriving them from raw strings at every call site.
2. As a maintainer, I want the memory-access shape (`bytes`, `signed`) decoded once, so that load/store width and signedness cannot drift across the codebase.
3. As a maintainer, I want a pure `extend(bits)` helper for sign/zero extension, so that the `lb`/`lbu`/`lh`/`lhu` extension rules live in one tested place instead of duplicated in both CPUs.
4. As a maintainer, I want `DecodedInstruction` to wrap the raw IR node rather than replace it, so that the assembler, parser, and `InternalRepresentation` contract stay untouched and the change stays low-risk.
5. As a maintainer, I want the class named `DecodedInstruction` (not `Instruction`), so that it does not read ambiguously against the raw node's `.instruction` mnemonic field or `riscvc.ts`'s `instructions[]` array.
6. As a maintainer, I want `DecodedInstruction` to live in `src/vcpu/`, so that it sits with the CPU model it serves.
7. As an AI agent navigating the code, I want instruction knowledge concentrated in one module with a fact-table test, so that I can read the whole instruction contract in one place.
8. As a maintainer, I want the ControlUnit decoder to consume `DecodedInstruction`, so that control-signal generation stops importing a grab-bag of predicates.
9. As a maintainer, I want the single-cycle CPU to consume `DecodedInstruction` for register access, funct3, and memory-access shape, so that its inline `switch(funct3)` decode disappears.
10. As a maintainer, I want the pipeline CPU to consume `DecodedInstruction` for its MEM-stage load/store handling, so that its duplicated width + extension logic disappears.
11. As a maintainer, I want the Simulator layer to obtain byte counts from `DecodedInstruction.memoryAccess()`, so that CPU-decoding logic stops leaking into the orchestration layer.
12. As a maintainer, I want `src/utilities/instructions.ts` deleted once all consumers migrate, so that the stringly-typed predicates cannot be called by new code.
13. As a maintainer, I want the migration done incrementally, one consumer at a time, so that the project compiles and the golden test stays green at every step.
14. As a maintainer, I want no forwarding shims left behind, so that the old stringly signatures cannot re-spread.
15. As a maintainer, I want a Vitest unit suite covering the instruction fact-table, so that the facts are verified without booting a VS Code host.
16. As a maintainer, I want targeted `extend()` unit cases (sign-extend `lb`, zero-extend `lbu`, the 16-bit `lh`/`lhu` pair), so that extension rules are pinned by example.
17. As a maintainer, I want a golden-output integration test that runs a small program through both CPUs and snapshots register file + data memory, so that any behaviour drift during migration is caught as a diff.
18. As a maintainer, I want the golden program to exercise every load/store form (`lb`, `lbu`, `lh`, `lhu`, `lw`, `sb`, `sh`, `sw`) plus a branch and a jump, so that the net covers the exact code most prone to silent breakage.
19. As a maintainer, I want the repo's first `test` script wired up, so that tests are runnable with one command.
20. As a maintainer, I want the domain term `DecodedInstruction` recorded in `CONTEXT.md`, so that a future architecture review does not re-suggest this same refactor.
21. As an educator relying on the simulator, I want load/store and branch/jump behaviour to remain identical after the refactor, so that existing example programs still produce the same results.

## Implementation Decisions

- **New module: `DecodedInstruction`** (class), constructed via a static `DecodedInstruction.from(rawNode)`. Lives in `src/vcpu/`. It **wraps** one Raw IR node and reads its fields lazily; it does not copy or replace the node. The assembler (`riscvc.ts`), the peggy-generated parser (`riscv.ts`), and the `InternalRepresentation` type are untouched.
- **Interface — instruction facts**: the class exposes, as its dotted interface, the replacements for the current predicates: register usage (`usesRs1`/`usesRs2`/`usesRd` and the register-name getters returning `regeq`), `funct3`/`funct7` access, opcode→type, `readsMemory`, `writesRegister`, `writesMemory`, `branchesOrJumps`, `storesNextPC`, `usesALU`, `usesImmediate`, and the specific-form predicates (`isIArithmetic`, `isILoad`, `isIJump`, `isAUIPC`, `isLUI`, `isILogical`). Exact method names to be finalized during implementation, staying close to existing vocabulary.
- **Interface — memory-access shape**: a single method `memoryAccess(): { bytes: 1 | 2 | 4, signed: boolean } | null`, derived once from `funct3`. Returns `null` when the instruction is not a load/store. This replaces the three `switch(funct3)` decoders (single-cycle CPU, pipeline CPU MEM stage, Simulator `bytesToReadOrWrite`).
- **Interface — extension**: a pure `extend(bits)` helper that sign- or zero-extends a loaded value's bit-string according to the same memory-access fact. Pure (bits in, bits out), no CPU state.
- **Seam boundary**: `DecodedInstruction` owns *classification and extension only*. The CPUs keep performing the actual `DataMemory.read`/`write`; they drive width/signedness off `memoryAccess()` and pass loaded bits through `extend()` instead of their own inline `switch`.
- **Consumers migrated (one per step)**: the ControlUnit decoder, the single-cycle CPU, the pipeline CPU, and the Simulator layer. Migration order runs decoder → single-cycle → pipeline → Simulator, then delete `src/utilities/instructions.ts`.
- **No shims**: consumers are swapped directly to `DecodedInstruction`; no forwarding functions are left in place. The compiler enumerates every call site as each file changes.
- **Domain model**: `CONTEXT.md` records `DecodedInstruction`, `Raw IR node`, and `Memory-access shape` (already drafted).

## Testing Decisions

- **What makes a good test here**: assert external behaviour through a seam, not implementation details. For `DecodedInstruction`, the seam is its public interface — construct from a representative raw node, assert the facts and memory-access shape; never reach into private field-reading. For the CPUs, the seam is the constructed CPU driven by a compiled program — assert observable end state (register file + data memory), not intermediate signals.
- **Two seams**:
  - *Seam 1 — `DecodedInstruction` interface (unit, Vitest)*. A table-driven fact matrix: one representative instruction per type/opcode (`add`, `addi`, `lw`/`lb`/`lbu`, `sw`/`sb`, `beq`, `jal`, `jalr`, `lui`, `auipc`), asserting the full fact row plus `memoryAccess()`. Separate targeted `extend()` cases for sign vs zero extension across the byte and half-word widths.
  - *Seam 2 — CPU level (integration/golden)*. Construct each CPU headless, feed a small compiled program, run to completion, snapshot register file + data memory. Built **before** any consumer migrates; re-run after each migration step to catch drift. The program exercises every load/store form plus a branch and a jump.
- **Modules tested**: `DecodedInstruction` (unit); single-cycle CPU and pipeline CPU (golden integration).
- **Prior art**: none — this is the repo's first test suite. Vitest is introduced for pure-logic unit tests (no VS Code host needed); the golden integration test drives the CPUs directly, exploiting that both are constructable without the extension host.

## Out of Scope

- Replacing or re-typing the Raw IR node, the `InternalRepresentation` contract, or the peggy grammar (`riscv.peg` / generated `riscv.ts`). `DecodedInstruction` wraps; it does not push types up into the parser.
- The extension↔webview message protocol (separate architecture-review candidate #2).
- Splitting the `RVContext` god-object (candidate #4).
- The graphic-pipeline connection topology and memory-table modules (candidates #5, #6) — though candidate #5 will later consume `DecodedInstruction`.
- Any `@vscode/test-electron` extension-host test suite; only pure-logic + headless-CPU tests are in scope.
- Behaviour changes: the refactor must be behaviour-preserving. New instruction support or bug fixes are not part of this spec.

## Further Notes

- The three pre-existing byte-width decoders are not identical: the Simulator returns a byte count only, while both CPUs additionally perform sign/zero extension off a control signal (`DMCtrl`) that equals `funct3` forwarded through the ControlUnit. `memoryAccess()` derived from `funct3` is therefore the single source for all three; the CPUs continue to pass their bits through `extend()`.
- This is the first item in a suggested sequence from the architecture review: `1 (this) → 3 (ICPU) → 2 (message protocol) → 4 (RVContext split)`, with webview candidates `5, 6` when those areas are next touched. Candidates #3 and #5 both lean on the `DecodedInstruction` vocabulary established here.
- Build is multi-session: this spec will be split by `/to-tickets` into tracer-bullet tickets under `.scratch/decoded-instruction/issues/`, worked blockers-first, each implemented in a fresh context window.
