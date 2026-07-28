# 02 — Typed protocol module + boundary parser

**What to build:** one typed contract for the extension↔webview messages, added
*beside* the existing untyped path so nothing else has to change yet. The extension
can construct its outgoing messages through typed builders, and the webview can take
a raw incoming value and parse it into a typed, validated message (or reject it).
This is the expand step of the type migration — consumers migrate in later tickets.

Design (grilling Q1–Q4, ADR-0005): a **type-only** protocol module in `src/`,
imported by both the extension bundle and the webview bundle. It defines the
`ExtensionMessage` union (extension→webview), discriminated on the existing
`operation` field, and holds/re-exports the datapath-view types (`MonocycleWires`,
`PipelineStages`) so the client will stop re-declaring them. A single
`parseExtensionMessage` validates an `unknown` into the union.

**Blocked by:** 01.

**Status:** ready-for-agent

- [ ] A type-only protocol module exists in `src/`, importable by both bundles.
- [ ] `ExtensionMessage` is a discriminated union keyed on `operation`, covering every message the host sends today.
- [ ] The datapath-view types live in (or are re-exported from) the module, ready for the client to import instead of re-declaring.
- [ ] `parseExtensionMessage(raw: unknown)` returns a typed message for valid input and rejects malformed / foreign / dropped-field input without throwing past the boundary.
- [ ] **Seam 1 tested** (Vitest): table-driven — each valid shape parses to the expected typed value; malformed, foreign, and dropped/renamed-field inputs are each rejected.
- [ ] Added beside the existing messaging; the app still builds and runs unchanged.
