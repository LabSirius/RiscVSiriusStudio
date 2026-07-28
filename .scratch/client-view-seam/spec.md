# Spec: Client view seam — Shell over Cycle effect + per-CPU DatapathPane

Status: ready-for-agent

Governing decision: `docs/adr/0005-client-datapath-pane-seam.md`. Domain vocabulary:
`CONTEXT.md` → "Client view seam (Shell / DatapathPane)" and "CPU stepping seam (ICPU)".

## Problem Statement

The RISC-V simulator's webview began life as a single-cycle-only React view. When
the pipeline CPU was added, it was bolted onto that same view as a prototype and
never separated. As a result one React application multiplexes two CPUs: a single
context holds both monocycle and pipeline render shapes, one message listener
handles both, and the branch between them is a duck-typed key probe
(`if (message.result.IF)`). The client re-declares the engine's render types by
hand and they have drifted (fields the host sends are silently dropped). The
developer finds this hard to maintain and wants the two datapath views separated —
without duplicating the parts that are genuinely shared (the registers,
data-memory and instruction-memory tables).

## Solution

Mirror the engine's existing ICPU / Datapath-view split (ADR-0003) onto the React
client, across the postMessage boundary.

- A single **Shell** renders everything that is CPU-independent — the registers
  table, the data-memory table, the read-only instruction-memory table, the
  editor and its highlight, the side panels, and the run/step/reset controls. Its
  only per-clock input is the **Cycle effect** already produced by the engine.
- A **DatapathPane** seam sits in a slot the Shell renders, blind to which CPU
  fills it. Two adapters — `MonocycleDatapathPane` (reads `MonocycleWires`) and
  `PipelineDatapathPane` (reads `PipelineStages`, and owns the pipeline-stages
  table) — are the only per-CPU code. The matching pane is selected **once, at
  mount**, from the host-declared CPU mode.
- The extension↔webview messages get **one typed protocol module** that both
  bundles import, with a single boundary parser that validates incoming data. The
  hand-mirrored client types are deleted; the `from` source guard is dropped
  (validation subsumes it); the `.IF` sniff disappears because each pane is
  statically typed to its CPU.

From the developer's perspective: the shared tables are written and maintained
once; adding or changing a datapath diagram touches only that pane; a wrong or
dropped message field is a compile error, not a silent mis-render.

## User Stories

1. As a student running a single-cycle program, I want the datapath diagram, the
   registers table and the memory tables to update each clock, so that I can see
   what the instruction did.
2. As a student running a pipelined program, I want the five-stage datapath and
   the pipeline-stages table to update each clock, so that I can watch
   instructions flow through the stages.
3. As a student, I want the registers table to show the same values regardless of
   which CPU I run, so that switching CPU model does not change what "the register
   file" means to me.
4. As a student, I want the data-memory table to reflect each committed load/store
   the same way in both CPU models, so that memory behaviour is consistent.
5. As a student, I want the instruction-memory table to show my program, so that I
   can map execution back to source; it does not change during simulation.
6. As a student, I want the edited-line highlight to follow the retiring
   instruction, so that the highlighted line agrees with the register/memory
   change shown that clock.
7. As a student switching between the single-cycle and pipeline simulator, I want
   the correct datapath view to appear, so that I always see the diagram for the
   CPU I chose.
8. As a developer, I want the shared tables implemented once, so that a fix to the
   registers or memory table applies to both CPU models without a second edit.
9. As a developer, I want the datapath rendering for each CPU isolated in its own
   pane, so that changing one diagram cannot break the other.
10. As a developer, I want the Shell to depend only on the Cycle effect, so that no
    pipeline-specific detail leaks into the shared layer.
11. As a developer, I want a single typed message contract shared by the extension
    and the webview, so that the producer and consumer cannot drift.
12. As a developer, I want a dropped or renamed message field to fail at compile
    time, so that I do not ship a silent mis-render (e.g. the previously dropped
    `add4` / `MuxResult.result`).
13. As a developer, I want incoming messages validated at the boundary, so that a
    malformed or foreign message is rejected rather than throwing deep in a
    reducer.
14. As a developer, I want the monocycle-vs-pipeline decision made once at mount,
    so that I never again duck-type on the accidental presence of an `IF` key.
15. As a developer, I want the "which wires light up" logic extracted as a pure
    function per datapath, so that I can unit-test the opcode/signal→edge mapping
    without mounting React.
16. As a developer, I want the machinery common to both connection controllers
    (the enabled-vs-all edge diff, the edge-id registry, wire animation) shared,
    so that the two panes stop being 360-line forks.
17. As a developer, I want the client message types imported from the one protocol
    module rather than re-declared, so that there is a single source of truth for
    the wire shape.
18. As a developer adding a third microarchitecture later, I want to add a third
    DatapathPane adapter without touching the Shell, so that the shared layer stays
    closed to per-CPU change.
19. As a developer, I want the webview→extension messages (register edits, memory
    edits, reset) typed too, so that both directions of the seam are safe.
20. As a maintainer, I want client tests to exist for the message parser and the
    edge kernel, so that these currently-untested surfaces gain regression cover.
21. As a student editing a register value in the table, I want my edit sent to the
    extension and applied, so that I can explore "what if" states; this works
    identically in both CPU models.
22. As a student editing a data-memory cell, I want the edit applied to the running
    CPU's memory, so that I can set up memory state before stepping.

## Implementation Decisions

- **One typed protocol module, in `src/`, type-only** (grilling Q1-A). Both the
  extension bundle and the webview bundle import it. It defines two discriminated
  unions — `ExtensionMessage` (extension→webview) and `WebviewMessage`
  (webview→extension) — and re-exports/holds the datapath-view types
  (`MonocycleWires`, `PipelineStages`) so the client stops re-declaring them
  (Q2-A, Q3-B).
- **Discriminate on the existing `operation` field**; drop the `from` source
  guard (Q4-B). The webview only ever receives messages from the extension, so the
  guard defended a non-existent threat. A single boundary parser
  (`parseExtensionMessage`) validates incoming `unknown` → typed union, rejecting
  anything that does not match. This parser replaces both the guard and the
  duck-typed routing.
- **Shell / DatapathPane split** (ADR-0005). The Shell is a single, CPU-independent
  React view consuming the **Cycle effect** plus initial program/memory load. The
  DatapathPane is a slot; `MonocycleDatapathPane` and `PipelineDatapathPane` are
  its two adapters. The Shell references no datapath-view type.
- **Selection once, at mount.** The host declares the running CPU (a mode message
  or an init handshake); the webview mounts the matching pane. Consequently the
  `step` payload does not need a `kind`-discriminated datapath union — each pane's
  step input is already typed to its CPU. (This resolves the earlier open Q5: it
  dissolves rather than being answered.)
- **Split `CurrentInstContext`** into a Shell context (over the Cycle effect) and a
  per-pane datapath context. Delete the drifted `ResultState` /
  `PipelineCycleResult` mirrors; consume the protocol module's types.
- **Extract a pure edge kernel** per datapath:
  `enabledEdges(view, instruction): Set<EdgeId>`. The two `useData*Conexions` hooks
  shrink to: call the kernel, diff against all edges, set React state. The
  `setCurrentType` side effect leaves the `useMemo`. Shared machinery (all-edges
  diff, `EdgeId` registry, wire-animation primitives) moves to a
  datapath-primitives module both panes import; the per-datapath edge lists stay
  per pane but stop being copy-forks.
- **Open sub-decisions for tickets (not blocking):** (a) one webview with a
  swapped pane vs two webviews — default one, since the Shell mounts once; (b) the
  DatapathPane contract — props-driven (`<DatapathPane view={…}/>`) vs imperative
  mount. Decide these at ticket time.
- **Scope of the datapath-view types on the wire:** they cross as their existing
  serialized (bit-string) shape. This spec does not introduce the `RiscvWord`
  value object (a separate deepening candidate); it only stops the types being
  re-declared.

## Testing Decisions

Good tests here assert **external behavior at a seam**, never implementation
detail. Two pure seams, both confirmed with the developer:

- **Protocol boundary parser** (`parseExtensionMessage`, and the reverse for
  `WebviewMessage`). Table-driven: each valid message shape parses to the expected
  typed value; malformed input, a foreign message, and a dropped/renamed field are
  each rejected (not thrown past). This seam covers the "typed contract + boundary
  validation" behavior — the replacement for the `from` guard and the `.IF` sniff.
- **Datapath edge kernel** (`enabledEdges` per datapath). Table-driven over
  instruction type × opcode × relevant signal (e.g. `buMux.signal`) → expected
  `Set<EdgeId>`. This is the real bug surface (opcode strings, branch-taken wiring)
  made testable by extraction out of `useMemo`.

Not behaviorally tested, by design:
- The **Shell / DatapathPane structural split** is a type invariant — "the Shell
  imports no `MonocycleWires` / `PipelineStages`." Enforce by the compiler (and, if
  cheap, a lint/import check), not a rendering test.
- The **Cycle effect** contract is already pinned by `src/vcpu/golden.test.ts`; the
  Shell consumes it, so no new engine test is needed.

Prior art: the root Vitest suites — `src/vcpu/instruction.test.ts`,
`src/vcpu/cycle.test.ts`, `src/vcpu/golden.test.ts` — are the model for
table-driven, behavior-only tests. The client currently has **no** test tooling; a
client Vitest harness (mirroring the root `vitest.config.ts`) is a prerequisite
ticket.

## Out of Scope

- The `RiscvWord` / 32-bit value object deepening (values stay bit-strings on the
  wire).
- Any change to the engine (`src/vcpu/`): ICPU, the Cycle effect, the
  `datapathView()` shapes, and the CPUs are untouched. This is a client-and-seam
  refactor.
- Re-styling or redesigning any table or diagram; behavior and appearance are
  preserved.
- Collapsing the `UIManager` relay beyond what dropping the `from` rewrite
  requires (the relay simplification is a natural consequence, not a goal here).
- Adding a third microarchitecture (the design leaves room; nothing is built).

## Further Notes

- Blockers-first ticket order: (1) client Vitest harness → (2) protocol module +
  boundary parser → (3) Shell / DatapathPane split → (4) extract the two panes,
  de-fork the connection controllers into shared primitives, extract `enabledEdges`
  → (5) drop the `from` guard, delete the `ResultState` / `PipelineCycleResult`
  mirrors, type both message directions.
- This spec extends ADR-0003 across the postMessage boundary; it does not
  re-litigate ADR-0001…0004. The Shell is the client peer of the text simulator;
  the DatapathPane is the client peer of a concrete CPU's `datapathView()`.
- History that led here (grilling trail): protocol module type-only (Q1-A),
  datapath types extracted into it (Q2-A), both directions typed ext-first (Q3-B),
  drop `from` + validate at boundary (Q4-B), `.IF` sniff dissolved by the view
  split. Recovered from a lost session's transcript plus its architecture-review
  report.
