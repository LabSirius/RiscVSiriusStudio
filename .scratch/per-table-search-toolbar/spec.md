# Per-table search toolbar

> **Update (2026-07-29):** shipped, then evolved via a `/prototype`. The
> magnifier-expand UI (Q6/Q6a) was replaced by an always-on **toolbar band** on
> top of each table (`TableSearchBand`), with table controls moved into the band.
> The memory `newPc > 0` gate (Q8) was **dropped** — search now works pre-step.
> Program memory also gained an auto-follow-PC toggle, a show-instruction-encoding
> toggle, and an instruction-text column. See ADR-0007 "Update (2026-07-29)".
> Decisions Q6, Q6a, Q8 below are superseded; the rest still hold.


Replace the global `SearchSection` side panel with a per-table search toolbar: each
simulator table (registers, data-memory, program-memory) owns a magnifier-expand search
box in its own top-right chrome, scoped to that one table. Fixes the shared
`MemoryTableContext.searchInMemory` string that today drives filtering on BOTH memory
tables off one input.

Grounded in `research/tabulator-per-table-search.md`. Settled via `/grill-with-docs`
on 2026-07-29.

## Settled decisions

| # | Decision | Resolution |
|---|----------|------------|
| Q1 | Mechanism | **Free-text box** — one query matched across fields via a function `setFilter`. NOT Tabulator per-column header filters. |
| Q4 | Memory scope | **One box per table.** data-memory and program-memory each own a local `useState`; `MemoryTableContext.searchInMemory` is deleted. |
| Q5 | Register fold | **Same UI, keep the escape (option B).** Registers get the same toolbar + local state, but keep `filterRegisters`/`clearRegisterFilter` + `filterTableData` paint underneath. `RegisterTableContext.searchInRegisters` is deleted. Declarative rewrite stays deferred to `register-search-declarative`. |
| Q2 | Memory fields | **Frozen 6-field list** `["address","value3","value2","value1","value0","hex"]`, both memory tables. Program-memory instruction-text search deferred to issue 02. |
| Q3 | Timing | **Instant** — no debounce, matches today's behavior. |
| Q6 | At-rest UI | **Magnifier-expand** in each table's existing top-right chrome; `✕` to clear. |
| Q6a | Collapse with active filter | **Filter persists on collapse; magnifier shows an active badge** (themed light + dark) so an active filter is never invisible. |
| Q7 | SearchSection | **Killed.** `LocatePc` relocates into program-memory chrome; the side "search" section is removed. |
| Q8 | Pre-step gating | **Preserve today's gate visibly.** Memory magnifiers hidden/disabled until `newPc > 0` (reuse the existing effect gate); register magnifier always live. |

## Net shape

Three tables, each with a magnifier→box in its own top-right chrome, each fed by local
state, each scoped to itself. Memory tables filter via generic `handle.setFilter`;
registers keep their `filterRegisters` escape + `filterTableData` cell-paint. Two context
fields die (`searchInMemory`, `searchInRegisters`). `SearchSection` gone, `LocatePc`
moved onto the program-memory table.

## The two-path inconsistency (deliberate, temporary)

After this ticket the SimulatorTable handle carries two filter paths: generic
`setFilter(predicate)` (memory) and register-specific `filterRegisters(search, theme)` /
`clearRegisterFilter()` (registers). This is a knowing, temporary asymmetry — collapsing
it to one path is `register-search-declarative`'s job, deferred because `filterTableData`
(hex→binary, neg-decimal-8-bit, binary→decimal candidates, per-cell theme paint) is
fiddly and untestable under the repo's node-only vitest. See ADR-0007.

## Explicitly out of scope (logged, not built)

- **Program-memory instruction-text search** (Q2 option B) → issue 02.
- **Register declarative rewrite** (drop `filterRegisters`, move paint to `rowFormatter`)
  → existing ticket `.scratch/register-search-declarative/`.
- **Dropping the `newPc` memory gate** (Q8 option C) — would make memory search symmetric
  with registers (searchable pre-step), but is a behavior change beyond this refactor.

## Affected code

- `components/panel/Sections/SearchSection.tsx` — deleted.
- `components/panel/Search/SearchInRegistersTable.tsx`,
  `components/panel/Search/SearchInMemoryTable.tsx` — deleted (inputs move into tables).
- `components/panel/Search/LocatePc.tsx` — relocated into program-memory chrome.
- `components/panel/Sections/MainSection/MainSection.tsx:12,78` — drop the SearchSection route.
- `components/panel/Sections/Tables/RegisterTable.tsx` — add toolbar; effect dep
  context→local; keeps `filterRegisters`.
- `components/panel/Sections/Tables/MemoryTable/AvailableMemory.tsx` — add toolbar;
  effect dep context→local.
- `components/panel/Sections/Tables/MemoryTable/ProgramMemory.tsx` — add toolbar; effect
  dep context→local; host relocated `LocatePc`.
- `context/shared/MemoryTableContext.tsx` — remove `searchInMemory`/`setSearchInMemory`.
- `context/panel/RegisterTableContext.tsx` — remove `searchInRegisters`/`setSearchInRegisters`.
