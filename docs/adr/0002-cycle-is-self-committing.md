# `cycle()` is self-committing; its result is observation, not computation

The seam between each CPU model (`src/vcpu/singlecycle.ts`, `src/vcpu/pipeline/pipeline.ts`)
and the orchestrating `Simulator` (`src/Simulator.ts`) is drawn on one axis:
**who advances architectural state**.

- **The CPU owns its architectural state.** `cycle()` advances the CPU's own
  register file, data memory, and program counter. Halt (`ebreak`) detection and
  PC advance (jump vs. next) are internal to `cycle()`; `finished()` reflects
  halt.

- **The result is an observation.** `cycle()` returns a **Cycle effect** — a
  read-only, CPU-independent record of what the clock committed (at most one
  register write, at most one memory access, the control transfer), each tagged
  with the producing `DecodedInstruction`. The caller reads it to *notify the
  UI*, never to *make state advance*.

## Why this line

Before this decision the single-cycle CPU's `cycle()` computed a combinational
wire snapshot but did **not** advance state. The Simulator advanced it, by
re-parsing that snapshot's render strings:

```
Simulator.step()  →  writeRegister(rd, result.wb.result)        // register commit
                  →  writeResult(...parseInt(result.dm.address,2)...)  // memory commit
                  →  jumpToInstruction(result.buMux.result)      // PC commit
```

The pipeline CPU already committed internally (in its WB stage). That asymmetry
was the root of ICPU's shallowness: the "result" was doing double duty — datapath
render data **and** the load-bearing computation the caller had to replay — so
architectural correctness was coupled to the render shape. Any change to the wire
snapshot could silently break simulation.

The rule is: **a render-shape change must never be able to break correctness.**
Uniform self-commit makes ICPU a genuine seam and is the precondition for
splitting the per-CPU **Datapath view** out of the shared contract (ADR-0003).

## Consequences

- The `cycle(): SCCPUResult | any` return union and the
  `stepResult.result as SCCPUResult` / `as PipelineCycleResult` downcasts in
  `Simulator.step()` disappear. The Simulator translates a **Cycle effect** into
  its `notifyRegisterWrite` / `notifyMemoryWrite` / `notifyMemoryRead` /
  `updateTextUI` calls; it no longer writes registers, memory, or PC itself.
- `jumpToInstruction` / `nextInstruction` become internal to `cycle()` and leave
  the public ICPU contract.
- This is behaviour-sensitive. The golden integration net (both CPUs, headless
  snapshots — from the DecodedInstruction migration) is the guard that self-commit
  preserves observable behaviour.
- Contrast ADR-0001, which drew the *ISA-fact vs datapath-control* line inside the
  decode path. This ADR draws the *commit vs. observation* line at the CPU/Simulator
  boundary. Together they make ICPU the CPU-independent stepping seam.
