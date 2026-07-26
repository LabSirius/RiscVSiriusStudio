# Spec: ICPU deepening — a self-committing CPU seam

Status: ready-for-agent

_Architecture-review candidate #3. Builds on the DecodedInstruction work (#1). Governed by `docs/adr/0002-cycle-is-self-committing.md` and `docs/adr/0003-datapath-view-is-off-icpu.md`; glossary terms in `CONTEXT.md` → "CPU stepping seam (ICPU)"._

## Problem Statement

`ICPU` (`src/vcpu/interface.ts`) is meant to be the one contract every CPU model implements, so the `Simulator` can drive single-cycle and pipeline CPUs the same way. It is not. It is a shallow, leaky interface:

- `cycle()` is typed `SCCPUResult | any` — the single-cycle datapath's wire-snapshot shape leaks into the shared contract, and the pipeline half is just `any`.
- The `Simulator` does **not** get polymorphism from it. `TextSimulator.step()` branches on `simulatorType === "monocycle"` vs. pipeline and downcasts the result (`stepResult.result as SCCPUResult` / `as PipelineCycleResult`). The per-CPU logic the interface was supposed to hide leaks straight back to the caller.
- Worst: for the single-cycle CPU, **advancing architectural state leaks out of the CPU into the Simulator**. `cycle()` already commits register writes and loads internally, but the Simulator (and the headless golden driver) commit **stores** and **advance the PC** externally, by re-parsing the render wires — `commitStore` reads `result.dm.dataWr`/`result.dm.address`, and PC comes from `result.buMux.result`. The pipeline CPU, by contrast, commits everything internally. So the single-cycle CPU's `cycle()` result does double duty: datapath render data **and** the load-bearing computation the caller must replay to make simulation correct.
- The remaining accessors are untyped: `currentInstruction(): any`, `getRegisterFile(): any`, `getDataMemory(): any`, `getProgram(): any[]`.

For a maintainer or an AI agent, "how does a CPU take one step" has no single honest answer: it depends on which CPU, and correctness is coupled to a render shape that looks like throwaway display data. A change to the datapath wire snapshot can silently break simulation.

## Solution

Make `ICPU` a genuine seam by drawing one line: **the CPU owns advancing its own architectural state; its result is an observation, never a computation the caller replays.**

- **Self-commit.** `cycle()` on every CPU advances its own register file, data memory, and program counter — including stores and PC advance, which the single-cycle CPU currently externalizes. (Register writes and loads are already internal; only stores + PC move in.) Halt (`ebreak`) detection becomes internal and is reflected by `finished()`.
- **Cycle effect.** `cycle()` returns a CPU-independent, per-clock observation of what the clock committed — at most one register write, at most one memory access, and the control transfer — each tagged with the producing `DecodedInstruction`. Both the text and graphic simulators drive their register/memory notifications from it. The `SCCPUResult | any` union and the Simulator's downcasts disappear.
- **Datapath view, off ICPU.** The per-CPU wire/stage render snapshot (today's `SCCPUResult` / `PipelineCycleResult`) is relocated to a concrete `datapathView()` on each CPU class — `MonocycleWires` / `PipelineStages` — captured during `cycle()` and consumed **only** by the graphic simulator through a statically-typed reference. Not part of the shared contract.
- **Typed accessors.** `currentInstruction()` → `highlightedInstruction(): DecodedInstruction` (retyped, renamed; per-CPU meaning preserved). The rest gain concrete types.

From the maintainer's perspective: "take one step" has one meaning across both CPUs, correctness no longer rides on render data, and the graphic-only datapath data is clearly marked as render-only. Observable simulation behaviour is unchanged — the existing golden net proves it.

## User Stories

1. As a simulator maintainer, I want `cycle()` to advance the CPU's own register file, data memory, and PC, so that architectural state lives in the CPU and not in the orchestration layer.
2. As a maintainer, I want the single-cycle CPU to commit its own stores, so that `commitStore`'s external re-parsing of the render wires disappears.
3. As a maintainer, I want the single-cycle CPU to advance its own PC, so that the caller stops driving control flow via `jumpToInstruction(result.buMux.result)`.
4. As a maintainer, I want `ebreak`/halt handled inside `cycle()` and surfaced by `finished()`, so that halt detection is not re-implemented in the Simulator.
5. As a maintainer, I want `cycle()` to return a CPU-independent **Cycle effect**, so that the `SCCPUResult | any` return union is gone.
6. As a maintainer, I want the Cycle effect framed per clock (≤1 register write, ≤1 memory access, control transfer), so that it is honest for the pipeline, where the register write (WB) and the memory access (MEM) belong to different in-flight instructions.
7. As a maintainer, I want each Cycle-effect field tagged with the `DecodedInstruction` that produced it, so that the UI can attribute a write or access to its instruction without the Simulator re-decoding.
8. As a maintainer, I want the `TextSimulator` to translate a Cycle effect into its register/memory notifications, so that it stops writing registers, memory, and PC itself.
9. As a maintainer, I want the `TextSimulator`'s branch on `simulatorType` and its `as SCCPUResult`/`as PipelineCycleResult` downcasts removed, so that the orchestration layer no longer knows which concrete CPU it holds.
10. As a maintainer, I want the datapath wire/stage snapshot relocated to a concrete `datapathView()` on each CPU, so that render data is off the shared `ICPU` contract.
11. As a maintainer, I want `datapathView()` typed per CPU (`MonocycleWires` / `PipelineStages`), so that the graphic layer reads it with a static type and no `kind`-switch.
12. As a maintainer, I want the datapath view captured during `cycle()`, so that the single-cycle combinational wires (valid only at cycle time) are still available to render.
13. As a maintainer, I want only the graphic simulator to consume a datapath view, so that the text simulator never depends on render shape.
14. As a maintainer, I want `currentInstruction()` renamed to `highlightedInstruction()` and typed `DecodedInstruction`, so that the accessor says what it is (the editor's highlight target) and stops being `any`.
15. As a maintainer, I want `highlightedInstruction()`'s per-CPU meaning preserved (single-cycle = executing, pipeline = fetched), so that editor line-highlighting behaviour does not change.
16. As a maintainer, I want `getRegisterFile()`, `getDataMemory()`, `getProgram()`, and the `replace*` accessors given concrete types, so that the last `any`s leave the interface.
17. As a maintainer, I want `jumpToInstruction`/`nextInstruction` off the public `ICPU` contract once PC advance is internal, so that the interface exposes only stepping and state.
18. As a maintainer, I want the headless monocycle golden driver collapsed to `while(!finished) cycle()`, identical to the pipeline driver, so that the test harness stops needing to know which CPU it holds.
19. As a maintainer, I want the golden snapshot files to stay byte-identical through the migration, so that self-commit is proven behaviour-preserving.
20. As a maintainer, I want a Cycle-effect unit test that pins the per-clock effect stream for both CPUs, so that the new observable the UI depends on is verified independently of end state.
21. As an educator relying on the simulator, I want register writes, memory reads/writes, branch/jump behaviour, and editor line-highlighting to be identical after the refactor, so that existing example programs and the classroom UI behave the same.
22. As an AI agent navigating the code, I want one honest answer to "how does a CPU take one step", so that I can reason about stepping without tracing which concrete CPU the Simulator holds.
23. As a maintainer, I want the deferred question of removing `highlightedInstruction()` from `ICPU` recorded as its own ticket, so that this behaviour-preserving refactor does not smuggle in a UI behaviour change.

## Implementation Decisions

- **`cycle()` is self-committing** (ADR-0002). Move the single-cycle CPU's store commit and PC advance out of the Simulator / golden driver and into `cycle()`. Register writes and loads are already internal; do not duplicate them. `ebreak`/halt detection moves inside `cycle()`; `finished()` reflects it. The pipeline CPU already self-commits — no behavioural change there, only its `cycle()` return type changes.
- **Cycle effect** is the new CPU-independent return type of `cycle()`. Per-clock shape: an optional register write (register + value + producing `DecodedInstruction`), an optional memory access (address + byte count + read/write + value + producing `DecodedInstruction`), and a control transfer (next PC + taken). In the single-cycle CPU every field derives from the one instruction; in the pipeline CPU the register write comes from the WB-stage instruction and the memory access from the MEM-stage instruction.
- **Datapath view off ICPU** (ADR-0003). `SCCPUResult` and `PipelineCycleResult` survive **only** as the render-view types `MonocycleWires` / `PipelineStages`, exposed by a concrete `datapathView()` on `SCCPU` / `PipelineCPU`, captured during `cycle()`. `ICPU` does not declare it. The `GraphicSimulator` obtains it through a statically-typed concrete CPU reference (construction-time typing or a per-CPU `GraphicSimulator` specialization) — no downcast on CPU kind. The extension serializes it to the graphic webview unchanged.
- **`ICPU` after the change** exposes stepping and architectural state only: `cycle(): CycleEffect`, `getPC()`, `finished()`, `highlightedInstruction(): DecodedInstruction`, `getRegisterFile(): RegistersFile`, `getDataMemory(): DataMemory`, `getProgram(): readonly DecodedInstruction[]`, `replaceDataMemory(...)`, `replaceRegisters(...)`. `jumpToInstruction`/`nextInstruction` leave the public contract (internal to `cycle()`).
- **`highlightedInstruction()`** replaces `currentInstruction()`, typed `DecodedInstruction`. Single-cycle returns the executing instruction; pipeline returns the just-fetched (IF/ID) instruction — meanings preserved.
- **`TextSimulator`** stops committing state. It maps a Cycle effect to `notifyRegisterWrite` / `notifyMemoryWrite` / `notifyMemoryRead` / `updateTextUI`, drops the `simulatorType` branch in `step()` and both result downcasts. `StepResult` (`Simulator.ts`) loses its `SCCPUResult | PipelineCycleResult` union.
- **Migration is incremental and blockers-first**, each step keeping the project compiling and the golden net green. Suggested order: (a) single-cycle self-commit of stores + PC behind the golden net, updating the headless driver in lockstep; (b) introduce the Cycle effect as `cycle()`'s return and route `TextSimulator` through it; (c) relocate the datapath view to concrete `datapathView()` and rewire `GraphicSimulator` to a static type; (d) retype the remaining accessors, rename `currentInstruction()`, and delete the `SCCPUResult | any` union and downcasts.
- **No shims.** Consumers move directly to the new shapes; no forwarding wrappers left behind.

## Testing Decisions

- **What makes a good test here**: assert behaviour through a seam, not implementation. For self-commit, the seam is the CPU's observable end state and its per-clock effect stream — never its private commit internals. For the datapath view, the seam is the snapshot of render values, not how they are captured.
- **Seam 1 — Golden integration net (existing, reused).** `src/vcpu/golden.test.ts` runs one assembled program (every load/store form plus a branch and a jump) headless through both CPUs and snapshots register file + data memory. The migration updates the **monocycle driver** (external store/PC commit → `while(!finished) cycle()`, matching the pipeline driver) while the `__snapshots__/` reference stays **byte-identical**. That unchanged golden is the behaviour-preservation proof for self-commit. When both drivers become the same loop, the harness demonstrably no longer needs to know which CPU it holds. Highest available seam; no new seam is better.
- **Seam 2 — Cycle-effect unit test (new, at the `ICPU` interface).** Drive each CPU headless through a small program and assert the per-clock **Cycle effect** stream: which clocks commit a register write, which a memory access, the control transfer, and the producing `DecodedInstruction` on each. This pins the new observable that the UI notifications depend on — which the end-state golden net cannot see (a wrong per-clock stream can still reach the right end state). Prior art: the table-driven `src/vcpu/instruction.test.ts` fact matrix.
- **Datapath view (optional).** A per-CPU snapshot of `MonocycleWires` / `PipelineStages` may be added to lock the render shape, but it is a behaviour-preserving relocation consumed only by the untested webview, so it is low priority and not required for the migration to be safe.
- **Modules tested**: `SCCPU` and `PipelineCPU` (golden end state + Cycle-effect stream). No VS Code host is needed; both CPUs are constructable headless, as the existing net already exploits.

## Out of Scope

- Any change to observable simulation behaviour. This is behaviour-preserving; new instruction support and bug fixes are not part of it. (The known `lui` pipeline crash and `lbu`/`lhu` parser gap are tracked separately.)
- Removing `highlightedInstruction()` from `ICPU` (deriving the highlight from the Cycle effect instead) — that changes pipeline editor-highlight behaviour and is deferred to `.scratch/icpu/deferred/highlightedinstruction-removal.md`.
- The extension↔webview message protocol itself (architecture-review candidate #2). The datapath view is serialized to the graphic webview as today; the protocol is untouched.
- Splitting the `RVContext` god-object (candidate #4) and the webview graphic/memory modules (candidates #5/#6). Candidate #5 will later consume the datapath-view vocabulary established here.
- Regenerating the peggy parser or re-typing the Raw IR node.

## Further Notes

- The single-cycle CPU is **not** self-committing from scratch: it already commits register writes and loads internally. The scope is narrower than "make `cycle()` self-commit" — only **store commit and PC advance** move inward. The clearest evidence is the golden driver's own comment (`golden.test.ts` ~line 108): `cycle()` "already performs register writes and memory loads internally, so the driver only has to commit stores to memory and advance the PC."
- Because the single-cycle datapath wires are combinational and valid only mid-cycle, `datapathView()` returns a snapshot captured *inside* `cycle()`, not recomputed afterward.
- Both ADRs mirror ADR-0001's axis: `ICPU` + Cycle effect is the CPU-independent stepping model (like `DecodedInstruction` on the ISA axis); the datapath view is the per-microarchitecture concern (like `ControlUnit`). No per-CPU abstraction of the view is built until a third microarchitecture needs it (YAGNI).
- This spec is intended to be split by `/to-tickets` into tracer-bullet tickets under `.scratch/icpu/issues/`, worked blockers-first, each implemented in a fresh context window, with the golden net green at every step.
