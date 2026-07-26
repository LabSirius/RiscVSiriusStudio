# Datapath view is CPU-specific and lives off ICPU

The seam between the shared **ICPU** contract (`src/vcpu/interface.ts`) and the
data used to draw the animated datapath diagram is drawn on one axis:
**CPU-independent stepping vs. per-microarchitecture render shape**.

- **ICPU carries only CPU-independent data.** It exposes stepping and
  architectural state, and `cycle()` returns a **Cycle effect** (the per-clock,
  CPU-independent observation — see ADR-0002). It exposes **no** datapath render
  data.

- **The Datapath view is a concrete per-CPU capability, off the interface.** The
  single-cycle CPU exposes `datapathView(): MonocycleWires` (the combinational
  wire bundle — `add4`, `ru`, `alu`, `buMux`, `wb`, …); the pipeline CPU exposes
  `datapathView(): PipelineStages` (the `IF`/`ID`/`EX`/`MEM`/`WB` latches). Each is
  captured **during** `cycle()`, because combinational wires are only valid at
  cycle time, and stashed for the graphic layer to pull.

## Why this line

Rendering the datapath needs values whose shape is irreducibly per-CPU — and even
per-diagram: monocycle *wires* versus pipeline *stage latches*. Today those shapes
ride on `cycle()`'s return as `SCCPUResult | any`, forcing every caller to
downcast on CPU kind (`result as SCCPUResult` / `as PipelineCycleResult`).

The graphic simulator is **already** CPU-specific: separate React diagrams and a
per-CPU connection controller (`client/simulator/src/context/graphic/`,
`useDataMonocycleConexions.ts`). So it can hold a statically-typed concrete CPU
reference (chosen at construction, or via a per-CPU `GraphicSimulator` subclass)
and read the right `datapathView()` with **no `as` and no `kind`-switch**. The
text simulator needs none of it — it consumes only the **Cycle effect** and the
register/memory state.

This mirrors ADR-0001. There, `DecodedInstruction` is the CPU-independent ISA
model and `ControlUnit` is the per-microarchitecture concern. Here, ICPU +
**Cycle effect** is the CPU-independent stepping model and the **Datapath view**
is the per-microarchitecture concern. Putting the view back onto ICPU — as a
`kind`-discriminated union or an opaque serializable payload — would re-leak
per-CPU shape into the shared contract, the exact defect this removes.

## Consequences

- Only the graphic simulator client consumes a Datapath view; the shared ICPU and
  the text simulator never reference `MonocycleWires` / `PipelineStages`.
- A third microarchitecture adds its own `datapathView()` return type and its own
  React diagram **without touching ICPU or the text simulator** — no per-CPU
  abstraction of the view is built until it is needed (YAGNI; same posture as
  ADR-0001's stance on a second `ControlUnit`).
- Because monocycle wires are combinational and valid only mid-cycle, the concrete
  CPU captures the view inside `cycle()` and returns the last-captured snapshot
  from `datapathView()`.
- `SCCPUResult` / `PipelineCycleResult` survive **only** as these render-view
  types; their former role as the CPU's committed output is gone (ADR-0002).
