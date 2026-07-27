# 04 — `cycle()` returns a Cycle effect; delete the result union and downcasts

**What to build:** Make `cycle()` return the CPU-independent, per-clock **Cycle effect** instead of the datapath result, and route the `TextSimulator` through it. With the datapath view already off `cycle()` (ticket 03) and the single-cycle CPU self-committing (ticket 02), the `SCCPUResult | any` return union and the Simulator's `simulatorType` downcasts have nothing left to serve and are deleted. This is the point where `ICPU` becomes a genuinely uniform seam — the orchestration layer stops knowing which concrete CPU it holds.

**Blocked by:** 02 (single-cycle self-commit), 03 (datapath view off ICPU).

**Status:** done

- [x] A `CycleEffect` type exists: per clock, an optional register write, an optional memory access (address, byte count, read/write, value), and the control transfer (next PC, taken) — each populated field tagged with its producing `DecodedInstruction`
- [x] `SCCPU.cycle()` and `PipelineCPU.cycle()` both return `CycleEffect`; single-cycle fills every field from the one instruction, pipeline fills the register write from WB and the memory access from MEM
- [x] `TextSimulator.step()` maps a `CycleEffect` to its `notifyRegisterWrite` / `notifyMemoryWrite` / `notifyMemoryRead` / step-message calls; the branch on `simulatorType` and the `as SCCPUResult` / `as PipelineCycleResult` downcasts are removed
- [x] `StepResult`'s `SCCPUResult | PipelineCycleResult` union is gone (`StepResult.result` → `StepResult.effect: CycleEffect`)
- [x] New Cycle-effect unit test (`src/vcpu/cycle.test.ts`, mirroring the `instruction.test.ts` fact-table): drives each CPU headless through a small program and asserts the per-clock effect stream — register writes, memory accesses, the taken control transfer, and the producing `DecodedInstruction`
- [x] Golden net green; project compiles (no new `tsc --noEmit` errors)

**Implementation note (strict ADR-0003):** the text simulator no longer sources
a datapath render payload — `cycle()` returns only the Cycle effect and the view
is off ICPU. Its `datapathPayload()` posts an empty bundle, so the **text-mode**
pipeline stages history table (`StagesPipeline`, fed by the posted `result`) no
longer updates. The graphic simulator is unaffected: `MonocycleGraphicSimulator`
/ `PipelineGraphicSimulator` source the real view from their concrete CPU's
`datapathView()`, and `PipelineGraphicSimulator` overrides `postStepUpdate()` to
post the stage latches. The one uniform effect path drives register/memory
notifications for both CPU kinds. Text-mode datapath is a deferred remainder (per
maintainer) — review separately.

**Behaviour delta to note on review:** pipeline memory notifications now fire
from the **MEM** commit (`effectFrom` reads `newState_MEM_WB`) rather than the
old EX-latch read, shifting the memory-panel highlight by one clock to the cycle
the access actually commits. Intended per the ticket ("memory access from MEM").
