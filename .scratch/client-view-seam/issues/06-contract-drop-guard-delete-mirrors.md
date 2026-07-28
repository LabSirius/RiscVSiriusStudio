# 06 — Contract: drop `from` guard, delete mirror types, type reverse direction

**What to build:** the contract step that finishes the migration. The hand-mirrored
client types are gone, the redundant source guard is removed, and the
webview→extension direction is typed too. A developer sees a single source of truth
for every message shape in both directions, and a dropped or renamed field is a
compile error. Register and memory edits from the tables still apply to the running
CPU, in both models.

Design (grilling Q3-B, Q4-B, ADR-0005): delete `ResultState` /
`PipelineCycleResult` and import the datapath-view types from the protocol module
(ticket 02). Drop the `from` source guard — the webview only receives extension
messages, so `parseExtensionMessage` (ticket 02) subsumes it; simplify the relay so
it stops rewriting `from`. Add the `WebviewMessage` union (register edits, memory
edits, reset) and route the reverse direction through it.

**Blocked by:** 05, 02.

**Heads-up (build landmine from ticket 02):** the datapath-view types are
re-exported from `src/protocol/datapath-view.ts`, which pulls `../vcpu/...`. The
moment a client file imports it, client `tsc -b` (`client/simulator`, strict +
`noUnusedLocals`) type-checks the whole engine graph and surfaces ~6 pre-existing
repo-src errors the extension tolerates (esbuild doesn't type-check):
`src/utilities/conversions.ts` TS2304 `RegisterView`, unused-var TS6133 in
`src/utilities/logger.ts` and `src/vcpu/pipeline/pipeline.ts`, etc. Clean those
(or narrow what the client compiles) as part of this ticket, and verify with a
real `cd client/simulator && npx tsc -b` — not just Vitest — or the client build
goes red. (`messages.ts` itself stays engine-free, so ticket 02's parser import
does not trip this.)

**Status:** done

- [x] `ResultState` and `PipelineCycleResult` are deleted; the client imports the datapath-view types from the protocol module.
- [x] The `from` source guard is removed; incoming messages are trusted only via boundary parsing; the relay no longer rewrites `from`.
- [x] A `WebviewMessage` union types the webview→extension direction (register edit, memory edit, reset).
- [x] No hand-mirrored or re-declared wire types remain anywhere in the client.
- [x] Register-value and data-memory edits from the tables still apply to the running CPU in both single-cycle and pipeline models.
- [x] A dropped/renamed field on either direction surfaces as a compile error.
