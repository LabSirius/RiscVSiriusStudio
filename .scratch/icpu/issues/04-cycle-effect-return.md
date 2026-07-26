# 04 — `cycle()` returns a Cycle effect; delete the result union and downcasts

**What to build:** Make `cycle()` return the CPU-independent, per-clock **Cycle effect** instead of the datapath result, and route the `TextSimulator` through it. With the datapath view already off `cycle()` (ticket 03) and the single-cycle CPU self-committing (ticket 02), the `SCCPUResult | any` return union and the Simulator's `simulatorType` downcasts have nothing left to serve and are deleted. This is the point where `ICPU` becomes a genuinely uniform seam — the orchestration layer stops knowing which concrete CPU it holds.

**Blocked by:** 02 (single-cycle self-commit), 03 (datapath view off ICPU).

**Status:** ready-for-agent

- [ ] A `CycleEffect` type exists: per clock, an optional register write, an optional memory access (address, byte count, read/write, value), and the control transfer (next PC, taken) — each populated field tagged with its producing `DecodedInstruction`
- [ ] `SCCPU.cycle()` and `PipelineCPU.cycle()` both return `CycleEffect`; single-cycle fills every field from the one instruction, pipeline fills the register write from WB and the memory access from MEM
- [ ] `TextSimulator.step()` maps a `CycleEffect` to its `notifyRegisterWrite` / `notifyMemoryWrite` / `notifyMemoryRead` / `updateTextUI` calls; the branch on `simulatorType` and the `as SCCPUResult` / `as PipelineCycleResult` downcasts are removed
- [ ] `StepResult`'s `SCCPUResult | PipelineCycleResult` union is gone
- [ ] New Cycle-effect unit test (Vitest, mirroring the `instruction.test.ts` fact-table): drive each CPU headless through a small program and assert the per-clock effect stream — which clocks commit a register write, which a memory access, the control transfer, and the producing `DecodedInstruction`
- [ ] Golden net green; text and graphic simulators behave identically; project compiles
