# SimulatorTable is one deep table module; Tabulator stays hidden, columns cross the seam as data

The webview's three Shell tables — registers, data-memory, instruction-memory —
are each built on the **Tabulator** library, and today each re-drives it
independently: four copy-pasted `new Tabulator(...)` lifecycle hooks (two of which
literally comment *"100% exact copy of the original component's useEffect"*), three
near-identical column-definition builders, and two near-verbatim data-memory
components differing only by column visibility. There is no shared table module.
This ADR introduces **SimulatorTable**: the one deep module every Shell table is an
adapter of (see CONTEXT.md), and records the two shape decisions a future reader is
likely to question.

## The decisions

- **Tabulator stays *hidden* behind SimulatorTable — not replaced, not abstracted
  over.** The module owns one Tabulator lifecycle (create / destroy / build /
  declarative data-sync / edit-relay); no caller holds a Tabulator instance. We are
  **not** dropping Tabulator for hand-rolled markup (virtual scroll, grouping,
  movable rows, inline editors all work today), and we are **not** introducing a
  render-backend abstraction over it — nothing varies across that backend, so a
  second adapter would be hypothetical. Deepen the one we have.

- **Columns cross the seam as Tabulator's `ColumnDefinition[]` — an accepted leak.**
  The `columns` prop is typed in the library's own type; callers and tests import
  it. We rejected wrapping columns in a repo-owned `ColumnSpec`: a spec rich enough
  for the real columns (tooltip, sorter, inline editor, `editable` predicate,
  hover-radix toggle, `cellMouseEnter`) would merely *re-declare* `ColumnDefinition`
  — a shallow wrapper padding the implementation. We also rejected a
  `preset`/`kind` discriminator, which would make the module know its callers by
  name. The depth is in the **lifecycle + declarative rows + edit-relay**; columns
  are data.

## Consequences

- The interface stays small: `columns`, declarative `rows` (the module diffs into
  `setData`), an `onEdit` relay, an escape `options?: Partial<Tabulator.Options>`
  for the genuinely divergent knobs (`initialSort`, `groupBy`, `movableRows`,
  `rowFormatter`, `index`), and an `onReady` handle. Lifecycle, row-diff, and
  edit-relay are **owned** — never routed through `options` — so the module does not
  degrade into a shallow passthrough.
- Transient per-clock cell animation (the write/read flash: timed DOM class over
  500 ms) is the one imperative concession, reached through the `onReady` handle
  (`flashCell`, `scrollToRow`) rather than the declarative surface. Deriving that
  flash from the **Cycle effect** is a later, separate step (architecture-review
  candidate C) that removes the handle.
- The two near-verbatim data-memory components collapse into **one** caller; the
  bin↔hex toggle becomes a column-visibility change on a single instance rather than
  a swap between two mounted components.
- Tests target **pure internal seams in the node environment** (the parameterized
  memory column builder, the options merge, the memory→rows transform) — the repo's
  vitest runs `environment: "node"` by deliberate decision (client-view-seam spec),
  and this ADR does not reverse that. The React+Tabulator shell carries little logic
  once data/columns/edit are declarative and is not DOM-tested.
- A fourth table adds a fourth adapter: columns + rows + options, no new lifecycle.
- If Tabulator is ever dropped (ADR left open), it is an **internal** swap behind
  SimulatorTable — invisible to callers, except the accepted `ColumnDefinition`
  leak at the `columns` prop, which would migrate with it.
