# 03 — Relocate the datapath view off ICPU

**What to build:** Move the per-CPU datapath render snapshot out of the shared contract into a concrete `datapathView()` on each CPU class, consumed only by the graphic simulator through a statically-typed reference (ADR-0003). The single-cycle datapath's `SCCPUResult` and the pipeline's `PipelineCycleResult` survive only in their render role, renamed to the **Datapath view** types `MonocycleWires` / `PipelineStages`. After this the graphic diagram is driven by `datapathView()`, not by `cycle()`'s return.

**Blocked by:** 02 (single-cycle self-commit).

**Status:** ready-for-agent

- [ ] `SCCPU` exposes `datapathView(): MonocycleWires`; `PipelineCPU` exposes `datapathView(): PipelineStages` (types renamed from `SCCPUResult` / `PipelineCycleResult`)
- [ ] The datapath view is captured **during** `cycle()` (the combinational single-cycle wires are valid only at cycle time) and returned from `datapathView()` as the last-captured snapshot
- [ ] `GraphicSimulator` obtains the view through a statically-typed concrete CPU reference (construction-time typing or a per-CPU specialization) — no `as`, no branch on CPU kind — and posts byte-identical data to the graphic webview
- [ ] `ICPU` does not declare `datapathView()`; the text simulator never references it
- [ ] `cycle()` still also returns the view in this ticket (old and new paths coexist so nothing breaks)
- [ ] Golden net green; graphic simulator renders identically for both CPUs; project compiles
