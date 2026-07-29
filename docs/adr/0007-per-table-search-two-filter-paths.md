# Search lives on each table; memory filters via setFilter, registers keep their escape — a deliberate two-path seam

The webview's search used to live in one global `SearchSection` side panel stacking
three controls (`LocatePc`, register search, memory search). Its memory box drove a
single shared string, `MemoryTableContext.searchInMemory`, which BOTH the data-memory and
program-memory tables read — so one input filtered two tables at once
(`ProgramMemory.tsx` comments the awkwardness). Register search sat in the same panel but
reached its table through a register-specific handle escape. This ADR records the shape
the per-table-search redesign settled on (see `.scratch/per-table-search-toolbar/spec.md`)
and the one decision a future reader is likely to question: why the SimulatorTable handle
now carries two different filter paths.

## The decisions

- **Search is a per-table control, scoped to one table.** Each of the three tables
  (registers, data-memory, program-memory) owns a magnifier-expand search box in its own
  top-right chrome, fed by **local component state**, filtering **only its own rows**. The
  shared `searchInMemory` and `searchInRegisters` context fields are deleted. Scope now
  lives where the table lives, not in a global panel. `SearchSection` is removed;
  `LocatePc` (program-memory navigation, not search) relocates onto the program-memory
  table.

- **Memory filters through the generic `setFilter`; registers keep the `filterRegisters`
  escape — two paths on the handle, on purpose.** Memory search is a plain multi-field
  substring `setFilter(predicate)`. Register search stays on the register-specific
  `filterRegisters(search, theme)` / `clearRegisterFilter()` escape, which runs the
  imperative `filterTableData` (hex→binary, negative-decimal-8-bit, binary→decimal
  candidate matching, plus per-cell theme paint of matching name/value cells). We did
  **not** unify registers onto `setFilter` in this work: that rewrite must move the paint
  into a `rowFormatter` and re-express the candidate matching, and `filterTableData` is
  fiddly and untestable under the repo's node-only vitest (no jsdom) — folding a
  behavior-drift risk into a UI-relocation change was rejected. The asymmetry is temporary;
  `register-search-declarative` collapses it to one path.

## Consequences

- The `searchInMemory` two-table span is fixed structurally: with per-table local state,
  no single input can reach two tables. Two context fields disappear (less shared mutable
  state).
- The handle temporarily exposes two filter idioms (`setFilter` for memory,
  `filterRegisters`/`clearRegisterFilter` for registers). A reader should not treat this as
  the intended end state — it is the seam mid-migration, tracked by
  `.scratch/register-search-declarative/`.
- Behavior is preserved, not changed: memory search keeps its frozen 6-field list and its
  `newPc > 0` gate (memory boxes are hidden/disabled pre-step); registers keep exact
  matching + paint. Two follow-ups are logged, not built — program-memory instruction-text
  search (`.scratch/per-table-search-toolbar/issues/02-*`) and the register declarative
  rewrite.
