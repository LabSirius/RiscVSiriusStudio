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

**Status:** ready-for-agent

- [ ] `ResultState` and `PipelineCycleResult` are deleted; the client imports the datapath-view types from the protocol module.
- [ ] The `from` source guard is removed; incoming messages are trusted only via boundary parsing; the relay no longer rewrites `from`.
- [ ] A `WebviewMessage` union types the webview→extension direction (register edit, memory edit, reset).
- [ ] No hand-mirrored or re-declared wire types remain anywhere in the client.
- [ ] Register-value and data-memory edits from the tables still apply to the running CPU in both single-cycle and pipeline models.
- [ ] A dropped/renamed field on either direction surfaces as a compile error.
