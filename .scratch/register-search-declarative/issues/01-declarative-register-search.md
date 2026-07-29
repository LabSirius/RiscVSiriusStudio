# Declarative register search (drop the filterTableData handle escape)

Status: needs-triage
Type: grilling

Future ticket. Deferred from the SimulatorTable registers migration (ticket #3), which
took the low-risk path A: register search crosses the SimulatorTable seam as a thin
handle escape (`filterRegisters(search, theme)` / `clearRegisterFilter()`) that runs the
existing imperative `filterTableData` + `resetCellColors` on the hidden instance.

## The deferred idea (option B)

Reimplement register search declaratively so no register-specific method sits on the
SimulatorTable handle:
- Filtering via the generic `handle.setFilter(predicate)` (predicate built purely from
  the search string).
- The per-cell match highlight (currently `filterTableData` colours matching name/value
  cells by theme) moved into a `rowFormatter` reading a live search ref, so it is
  declarative and survives redraw.

## Why it was deferred, not done

`filterTableData` (`utils/tables/handlersRegisters.ts`) is fiddly and untested at the
DOM level (repo vitest is `environment: "node"`, no jsdom):
- `0x` hex path → binary substring match.
- Negative decimal → two's-complement at **8 bits** (note: not 32) candidate.
- Plain binary string → decimal + zero-padded-32 candidates.
- Per-cell background colour by theme (`#3A6973` dark / `#D1E3E7` light) on matching
  name/value cells.

Reimplementing risks subtle behaviour drift on these branches. Belongs with the broader
register-search cleanup, ideally alongside candidate B (`Word` radix) since both touch
the value representation.

## Overlap with per-table-search-toolbar (settled 2026-07-29)

The `.scratch/per-table-search-toolbar/` work (spec + ADR-0007) moves register search into
a per-table toolbar with **local state**, but deliberately KEEPS this escape
(`filterRegisters`/`clearRegisterFilter` + `filterTableData` paint) untouched — option B in
that spec. So after it ships:
- The register search *input* is local, no longer `RegisterTableContext.searchInRegisters`
  (that field is deleted). This ticket's search-effect target is now local state, not context.
- This ticket is what removes the escape and unifies registers onto generic
  `setFilter(predicate)` + a `rowFormatter` highlight — collapsing the deliberate two-path
  seam recorded in ADR-0007.
- The scope question below is resolved: register search is per-table (its own toolbar);
  memory search is likewise per-table. No cross-table scope to unify anymore.

## Open decisions to grill

- Keep the exact hex/decimal/binary candidate-matching semantics, or simplify/spec them?
- Is the per-cell highlight worth preserving, or is row-level filtering enough?
- Does search scope stay register-only, or unify with the memory search-scope item logged
  in `.scratch/simulatortable`?

## Affected code

- `utils/tables/handlersRegisters.ts` — `filterTableData`.
- `components/panel/Sections/Tables/SimulatorTable.tsx` — the `filterRegisters` /
  `clearRegisterFilter` handle escapes added in #3 (to be removed by this ticket).
- `components/panel/Sections/Tables/RegisterTable.tsx` — the search effect.
