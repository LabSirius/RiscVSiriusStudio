# 05 — DatapathPane seam + two adapters

**What to build:** the per-CPU datapath rendering moves behind a **DatapathPane**
seam with two adapters, selected once at mount. A student running the single-cycle
CPU sees the monocycle datapath; a student running the pipeline CPU sees the
five-stage datapath and the pipeline-stages table — each rendered by its own pane,
neither able to break the other. The monocycle-vs-pipeline decision is made once,
not by sniffing a message key.

Design (ADR-0005): a DatapathPane slot the Shell renders, blind to which CPU fills
it. `MonocycleDatapathPane` reads `MonocycleWires`; `PipelineDatapathPane` reads
`PipelineStages` and owns the pipeline-stages table. Each uses its `enabledEdges`
kernel (ticket 03). The host declares the running CPU; the webview mounts the
matching pane at startup, so each pane's step input is statically typed to its CPU
and the `.IF` duck-typing is gone. Decide at implementation time: one webview with a
swapped pane (default) vs two webviews; and the pane contract (props-driven
`<DatapathPane view={…}/>` vs imperative mount).

**Blocked by:** 04, 03.

**Heads-up:** if a pane imports `MonocycleWires`/`PipelineStages` from
`src/protocol/datapath-view.ts` (rather than the existing client mirror, which
ticket 06 deletes), it trips the client `tsc -b` engine-graph landmine — see the
Heads-up in ticket 06. Verify with a real `cd client/simulator && npx tsc -b`.

**Status:** ready-for-agent

- [ ] A DatapathPane slot is rendered by the Shell without the Shell knowing which CPU fills it.
- [ ] `MonocycleDatapathPane` and `PipelineDatapathPane` are the two adapters; the pipeline-stages table lives inside the pipeline pane.
- [ ] The pane is selected once, at mount, from the host-declared CPU mode — no per-message discrimination, no `message.result.IF` sniff.
- [ ] Each pane consumes its `enabledEdges` kernel from ticket 03.
- [ ] Single-cycle and pipeline each render their correct diagram; switching CPU model shows the right pane.
- [ ] No cross-pane coupling: a change isolated to one pane cannot alter the other's diagram.
