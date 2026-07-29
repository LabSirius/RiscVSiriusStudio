# Per-table search toolbar (magnifier-expand, one per table)

Status: ready-for-agent
Type: task

Implements `spec.md`. Move search off the global `SearchSection` side panel and into a
per-table magnifier-expand toolbar in each table's own top-right chrome. Fixes the shared
`searchInMemory` two-table span.

## Scope

Three tables, each: a magnifier icon in the existing top-right chrome that expands to a
free-text `<input>` (`✕` clears), fed by a **local `useState`**, scoped to that table only.

### Registers (`RegisterTable.tsx`)

- Add magnifier→box in the chrome by `closeRT` (`:273-278`). Always live (no step gate).
- Search effect (`:224-232`) unchanged mechanically — keeps `handle.filterRegisters(text,
  theme)` / `clearRegisterFilter()`. Only swap the effect dep from context
  `searchInRegisters` to the local state.
- Remove `searchInRegisters`/`setSearchInRegisters` from `RegisterTableContext`.

### Data memory (`AvailableMemory.tsx`) and Program memory (`ProgramMemory.tsx`)

- Add magnifier→box in each table's chrome. **Hidden/disabled until `newPc > 0`** (reuse
  the gate already in both effects: `AvailableMemory.tsx:229`, `ProgramMemory.tsx:156`).
- Search effect: keep `handle.setFilter(...)` / `clearFilter()` over the frozen field list
  `["address","value3","value2","value1","value0","hex"]`. Only swap the effect dep from
  context `searchInMemory` to the local state.
- Remove `searchInMemory`/`setSearchInMemory` from `MemoryTableContext`.

### Magnifier behavior (all three)

- **Instant** filtering — feed the input's value straight to state, no debounce.
- **Collapse keeps the filter.** When the box collapses with non-empty text, the filter
  stays applied and the magnifier renders an **active badge** (dot/accent), themed for
  light and dark, so an active-but-hidden filter is always signalled. Reopening restores
  the text. `✕` clears text AND filter AND badge.

### SearchSection teardown

- Delete `SearchSection.tsx`, `SearchInRegistersTable.tsx`, `SearchInMemoryTable.tsx`.
- Drop the SearchSection route in `MainSection.tsx` (`:12` import, `:78` render).
- Relocate `LocatePc` into program-memory's chrome (next to its collapse arrow,
  `ProgramMemory.tsx:201-207`). It is navigation, not search — place it as its own control,
  not inside the search box. Keep its `setLocatePc(true)` → scroll behavior intact.

## Acceptance

- Each table's box filters only its own rows. No input filters two tables.
- `searchInMemory` and `searchInRegisters` no longer exist in any context.
- Register hex/decimal/binary matching + cell-paint highlight unchanged (still via
  `filterTableData`).
- Memory magnifiers absent/disabled before the first step; present after.
- Collapsing a box with active text keeps rows filtered and shows the magnifier badge.
- `LocatePc` works from program-memory chrome; the side "search" section is gone.

## Notes / hazards

- Two filter paths remain on the SimulatorTable handle after this (setFilter for memory,
  filterRegisters for registers) — deliberate, see ADR-0007 and issue in
  `register-search-declarative`.
- Register table is narrow (min-width 22.7rem); confirm the expanded box + collapse arrow
  lay out on one row, else give the box its own line when expanded.
- Memory search redraw re-runs the PC-icon `rowFormatter` (`markPc`) — verify the PC icon
  still repositions after filter/clear (today's effects rely on this, `AvailableMemory.tsx:239`).
