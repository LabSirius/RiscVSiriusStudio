# 03 — Extract enabledEdges kernel + de-fork conexions primitives

**What to build:** the "which wires light up this clock" logic becomes a pure,
testable function, and the machinery shared by the two connection controllers stops
being a copy-fork. A developer can unit-test the opcode/signal→edge mapping without
mounting React, and both datapath diagrams still render exactly as before.

Design: extract `enabledEdges(view, instruction): Set<EdgeId>` per datapath
(monocycle, pipeline) out of the two `useData*Conexions` `useMemo` bodies; the
`setCurrentType` side effect moves out of the memo. Common machinery — the
enabled-vs-all-edges diff, the `EdgeId` registry, wire-animation primitives — moves
into a shared datapath-primitives module both panes import. Per-datapath edge lists
stay per datapath but stop being forks. This prepares ticket 05.

**Blocked by:** 01.

**Status:** done

- [ ] `enabledEdges` is a pure function per datapath (no React, no state mutation), taking the datapath view + instruction and returning the enabled `EdgeId` set.
- [ ] The connection-controller hooks shrink to: call the kernel, diff against all edges, set React state — with no side effect inside `useMemo`.
- [ ] Machinery common to both controllers (all-edges diff, `EdgeId` registry, wire animation) lives in one shared module both import; the two controllers no longer duplicate it.
- [ ] **Seam 2 tested** (Vitest): table-driven over instruction type × opcode × relevant signal (e.g. `buMux.signal`) → expected edge set, for both datapaths.
- [ ] Both diagrams render identically to before (no visual regression).
- [ ] Debug residue (e.g. stray `console.log`) in the touched controllers is removed.
