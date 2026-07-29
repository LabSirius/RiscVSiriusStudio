# Per-table search toolbar over the hidden Tabulator instance — source-grounded research

Research for the question: **can each simulator table own an in-table search toolbar
(a small bar on top of that one table, whose search/filter is scoped to that table
only) to replace today's global `SearchSection` panel, whose memory search awkwardly
spans two tables?**

All repo paths are relative to repo root `/home/gg/Documents/RiscVSiriusStudio`. Line
numbers reflect the tree on branch `refactor/simulatortable-foundation` at the time of
writing. Tabulator citations are to the **installed** package
`client/simulator/node_modules/tabulator-tables/` **v6.3.1** (`package.json:6` reports
`"version": "6.3.1"`), which ships its unminified ES source under `src/js/` — the
authoritative primary source. The public docs at <https://tabulator.info/docs/6.3>
return **HTTP 403 to automated fetches**, so doc URLs below are cited as canonical
references but every *behavioral* claim is traced to the installed source file:line, not
to the (unfetchable) doc prose. Anything the source did not confirm is under **Open
questions**, not guessed.

> Note: the package ships **no `.d.ts`** (`find . -iname '*.d.ts'` under the package is
> empty; `package.json` declares only `main`/`module`/`exports`, no `types`). The repo's
> TypeScript types for `tabulator-tables` therefore come from a separate `@types`
> resolution, not from the runtime package. Behavior below is read from the runtime JS.

---

## 1. Tabulator's own facilities

### 1.1 Programmatic filtering (`setFilter` / `addFilter` / `clearFilter` / custom fns)

The Filter module registers these as **table functions** (callable on the instance):
`modules/Filter/Filter.js:40-53`

- `searchRows(field, type, value)` — `:181`
- `searchData(field, type, value)` — `:186`
- `setFilter(...)` → `userSetFilter` — `:43`, impl `:599`
- `addFilter(...)` → `userAddFilter` — `:45`, impl `:610`
- `getFilters(all, ajax)` — `:46`, impl `:686`
- `removeFilter(field, type, value)` — `:51`, impl `:743`
- `clearFilter(all)` — `:52`, impl `:772`
- `clearHeaderFilter()` — `:53`, impl `:783`

**`setFilter` replaces the whole programmatic filter list** (`setFilter` clears
`this.filterList = []` then calls `addFilter`, `:600-606`); **`addFilter` appends**
(`:610-628`). Both accept either a single `{field,type,value,params}`, an array of them
(AND), or an array-of-arrays (OR sub-filters, `findSubFilters` `:665`).

**Custom filter function**: if `filter.field` is a **function**, Tabulator calls it as
`field(rowData, params)` per row and keeps the row when it returns truthy
(`findFilter`, `:641-646`). This is exactly what the repo uses today — the
`SimulatorTableHandle.setFilter(predicate)` escape calls `instance.setFilter(predicate)`
(`SimulatorTable.tsx:194-196`), i.e. a single free-text multi-field match expressed as
one function filter.

**Built-in filter types** (used when `type` is a string) are keyed in
`modules/Filter/defaults/filters.js:4-100`:
`=`, `<`, `<=`, `>`, `>=`, `!=`, `regex`, `like`, `keywords`, `starts`, `ends`, `in`.
`like` is the case-insensitive substring match (`:43`).

Doc: <https://tabulator.info/docs/6.3/filter> (Filtering Data / "Programmatic Filtering").

### 1.2 Header filters (built-in per-column search inputs)

Header filters are declared **per column, in the column definition** — they cross the
SimulatorTable seam as part of the `columns` prop (`ColumnDefinition[]`), the
ADR-0006-accepted leak, **not** through the handle. The Filter module registers these as
**column options** (`Filter.js:33-38`) plus the `headerFilter` option itself:

- `headerFilter` — the editor to render in the header (e.g. `true`/`"input"`, `"list"`,
  `"number"`, a custom editor, or a function). Resolution in `initializeColumn`
  (`:335-361`): a string names a built-in editor; `true` reuses the column's own editor;
  otherwise a function/editor object.
- `headerFilterFunc` — the match function: a built-in type string (e.g. `"like"`, `"="`)
  or a custom `(headerValue, rowValue, rowData, params) => boolean`
  (`:221-245`).
- `headerFilterFuncParams` — params passed to that func (`:37`).
- `headerFilterPlaceholder` — placeholder text; falls back to
  `langText("headerFilters|default")` when unset (`:421`).
- `headerFilterParams` — params for the header editor (`:34`, `:403`).
- `headerFilterEmptyCheck` — decides when a header value counts as "empty"/cleared
  (`:35`, `:327`).
- `headerFilterLiveFilter` — whether it filters live on keypress (default on for most
  editors; `:458-466`).
- Table option `headerFilterLiveFilterDelay` — debounce before applying, **default
  300 ms** (`:29`, `:451`).

**Default match type** when `headerFilterFunc` is not given: `"like"` for text-style
editors, `"="` for exact editors (`:264`, `:271`).

**Programmatic control of header filters**:
`setHeaderFilterValue(column, value)` (`:49`, `:550`),
`getHeaderFilterValue(column)` (`:48`, `:541`),
`setHeaderFilterFocus` (`:47`), `getHeaderFilters()` (`:50`, `:732`),
`clearHeaderFilter()` (`:53`, `:783`), plus column-component versions
(`setHeaderFilterValue`, `getHeaderFilterValue`, `reloadHeaderFilter`, `:55-58`).

**Header vs programmatic — the key difference**: header filters render **one input per
column, inside that column's header cell** (part of the table's own `.tabulator-header`
DOM), each scoped to its own field. Programmatic `setFilter` (esp. a function filter)
gives you **one query matched across many fields** with no per-column DOM. `getFilters`
distinguishes them: header filters are returned only when `all=true` (`getFilters` →
`getHeaderFilters`, `:686-690`; `clearFilter(all)` clears header filters too only when
`all`, `:772-776`).

Doc: <https://tabulator.info/docs/6.3/filter> ("Header Filtering").

### 1.3 Is there a built-in toolbar / header region to inject a search widget into?

**No dedicated "toolbar" concept exists.** A recursive grep for `toolbar` across
`src/js/modules/` and `src/js/core/` returns nothing. The built-in DOM regions are:

- **Column header row** (`.tabulator-header`) — hosts header-filter inputs (§1.2), one
  per column. Toggled by the `headerVisible` option (`core/defaults/options.js:37`).
  This is the only built-in place a search input lives, and it is inherently
  per-column, driven by the column definitions.
- **Footer** — `footerElement` option (`core/defaults/options.js:29`), managed by
  `core/FooterManager.js`. It accepts an **HTML string** (`:42-44`), a **CSS selector**
  for an external element (`:45-46`), or an **element** (`:51`); custom content is added
  via `append(element)` (`:61-64`). The footer is appended to the **bottom** of the
  table element (`getElement` appended to `table.element`, `:82-93`) — it is a footer,
  not a top bar, and it is Tabulator-owned/option-driven.
- No "custom header contents" slot above the columns, and column groups
  (`modules/ColumnCalcs`, grouping) are for column organization, not a widget region.

There is also a `placeholder` option (`core/defaults/options.js:56`) — that is the
**empty-data placeholder** shown when the table has no rows, **not** a search box.

**Conclusion:** Tabulator has **no built-in "search / find" widget**. Search is always
**filter-based** — either per-column header filters (§1.2) or programmatic filters
(§1.1). A single unified search *bar sitting on top of one table* is not a Tabulator
primitive; it must be **your own React DOM above the table container**, OR you accept
per-column header-filter inputs rendered inside the table header.

---

## 2. React toolbar patterns over a hidden Tabulator instance (ADR-0006)

ADR-0006 (`docs/adr/0006-simulatortable-hides-tabulator.md`) and CONTEXT.md ("SimulatorTable",
`CONTEXT.md:52-53`) fix the constraint: **no caller holds a Tabulator instance**;
lifecycle/data-sync/edit-relay are owned; the only imperative concessions are reached
through the `onReady` handle. So a search toolbar has three shapes, in increasing
declarativeness:

### Option A — Header filters via the `columns` prop (fully declarative, no handle)

Because `headerFilter*` are **column-definition** options and `columns: ColumnDefinition[]`
already crosses the seam by design (ADR-0006, `SimulatorTable.tsx:62-64`; the
"columns are data" decision, ADR-0006 §"Columns cross the seam as … `ColumnDefinition[]`"),
per-column header-filter inputs can be added **today with zero new API** — just set
`headerFilter`/`headerFilterFunc`/`headerFilterPlaceholder` in each table's column
builder (`utils/tables/definitions/memoryColumns.ts`,
`.../definitionsColumns.ts:getColumnsRegisterDefinitions`). This is inherently
table-scoped (each table filters its own rows) and needs **no** `SimulatorTable` change.
Cost: it is **N inputs in the header**, one per column, not a single free-text box, and
it cannot reproduce the current cross-field / hex↔binary candidate matching
(`filterTableData`, §3.4) inside one box.

### Option B — Toolbar as sibling React DOM above `SimulatorTable`, driven imperatively

Render a React `<div>` search bar **above** `<SimulatorTable/>` inside each table
component (`RegisterTable.tsx`, `AvailableMemory.tsx`, `ProgramMemory.tsx`) and wire its
input to the **existing handle**. The current handle surface is
(`SimulatorTable.tsx:25-60`):

- `setFilter(predicate: (row: Record<string, unknown>) => boolean): void` (`:34`, impl `:194`)
- `clearFilter(): void` (`:36`, impl `:197`)
- `filterRegisters(search: string, theme: string): void` (`:55`, impl `:234`)
- `clearRegisterFilter(): void` (`:57`, impl `:237`)

These already exist and are already called from local search effects
(`ProgramMemory.tsx:155-169`, `AvailableMemory.tsx:228-241`, `RegisterTable.tsx:224-232`).
A per-table toolbar would just move the **input** from the global `SearchSection` into
each table and feed a **local `useState`** instead of shared context — the filter path
below the handle is unchanged. This is the smallest change and preserves the fiddly
`filterTableData` matching. It keeps a per-table imperative escape (`setFilter`), which
the `register-search-declarative` ticket (§3.6) wants to remove for registers.

### Option C — Declarative `searchTerm` prop on SimulatorTable

Add an optional `searchTerm?: string` (+ maybe a `searchFields`/`searchPredicate`) prop;
SimulatorTable runs the function filter internally in an effect. Most aligned with the
ADR's "columns and rows go in, edits come out" ethos and would let the
`register-search-declarative` ticket drop `filterRegisters`/`clearFilter` from the
handle. Cost: SimulatorTable must own a filter concept, and the register per-cell
highlight (background-colour matching cells, §3.4) is **not** expressible as a pure
row filter — it currently mutates cell DOM (`filterTableData`), so it would need to move
into a `rowFormatter` reading a live search ref (exactly what the deferred ticket
proposes, `.scratch/register-search-declarative/issues/01-declarative-register-search.md:16-19`).

### Option D — Toolbar rendered by SimulatorTable itself (optional slot)

SimulatorTable could render an optional toolbar slot above its container. This pushes a
presentational concern into the deep module and risks re-shallowing it (the ADR warns
against SimulatorTable knowing its callers / growing preset behavior,
`CONTEXT.md:53`). A caller-owned sibling toolbar (Option B/C driving via prop/handle)
keeps SimulatorTable about *the table*, not *the chrome around it*. **Weakest fit** with
ADR-0006.

**Where a toolbar physically goes:** since Tabulator exposes no top region (§1.3), the
bar is React DOM *above* the SimulatorTable wrapper `<div className={className}>`
(`SimulatorTable.tsx:170-174`). Each table component already renders exactly such
sibling chrome next to `<SimulatorTable/>` — the collapse arrow and the data-memory
hover menu (§3.5) — so a toolbar is a natural neighbor there, not a new structural idea.

---

## 3. What already exists in this repo

### 3.1 The global `SearchSection` panel

`components/panel/Sections/SearchSection.tsx:6-20` stacks three controls in the
left-sidebar "search" section:
1. `<LocatePc/>` — `Search/LocatePc.tsx`
2. `<SearchInRegistersTable/>` — `Search/SearchInRegistersTable.tsx`
3. `<SearchInMemoryTable/>` — `Search/SearchInMemoryTable.tsx`

It is rendered by the section router (`MainSection/MainSection.tsx:78`, imported `:12`)
when the sidebar "search" section is active (during `step`; see detail-panels.md §4).
So today search is a **separate side panel**, not attached to any table.

### 3.2 `Search/LocatePc.tsx` — what it does

`Search/LocatePc.tsx:5-15`: a button that calls `setLocatePc(true)` on
`MemoryTableContext`. `ProgramMemory.tsx:127-132` consumes `locatePc` and scrolls the PC
row to top, then resets it. Scoped to the program-memory table (not a text search).

### 3.3 `Search/SearchInRegistersTable.tsx` — register search input

`Search/SearchInRegistersTable.tsx:5-24`: a single text input, placeholder
`"e.g x17 or 12 or 1100 or 0xC"`, whose `onChange` calls `setSearchInRegisters` on
**`RegisterTableContext`** (`context/panel/RegisterTableContext.tsx:24-25,35,38`).
Consumed by **one** table: `RegisterTable.tsx:224-232` runs a search effect that calls
`handle.filterRegisters(searchInRegisters, theme)` (or `clearRegisterFilter` when empty).
Register search therefore hits a **single** table already — its awkwardness is the
*handle escape* (`filterRegisters`), not scope (§3.6).

### 3.4 `Search/SearchInMemoryTable.tsx` — memory search input **hits two tables**

`Search/SearchInMemoryTable.tsx:4-22`: a single text input, placeholder `"e.g 1234"`,
`onChange` → `setSearchInMemory` on **`MemoryTableContext`**
(`context/shared/MemoryTableContext.tsx:57-58,85,115-116`).

**`searchInMemory` is one shared string consumed by TWO tables:**
- `AvailableMemory.tsx:57` reads it; the search effect `:228-241` filters the
  **data-memory** table over fields `["address","value3","value2","value1","value0","hex"]`.
- `ProgramMemory.tsx:34` reads the **same** state; the search effect `:155-169` filters
  the **program-memory** table over the same field list.

Both call `handle.setFilter(...)` / `handle.clearFilter()` on their own instances, but
off **one** input. `ProgramMemory.tsx:152-154` documents this explicitly:
> "`searchInMemory` is shared, so this still filters the available-memory table at the
> same time — program search scope is logged for a later split."

**This is the exact awkwardness the question targets:** one "Search in memory table" box
drives filtering on both the data-memory and program-memory tables simultaneously,
because they share `MemoryTableContext.searchInMemory`. Splitting it means each table
reads a **local** search term (from its own toolbar) instead of the shared context field.

The register matching logic is richer than plain substring: `filterTableData`
(`utils/tables/handlersRegisters.ts:65+`) handles `0x` hex → binary-substring,
negative-decimal → 8-bit two's-complement, pure-binary → decimal+padded candidates, and
colours matching name/value cells by theme; `resetCellColors`
(`utils/tables/handlersShared.ts`) clears it. Memory search, by contrast, is the plain
multi-field `.includes()` function filter shown above.

### 3.5 The tables and their existing per-table chrome (where a toolbar could join)

Strip assembled in `Tables.tsx:15-33`: `<RegisterTable/>`, then a `#memoryTables` div
holding `<AvailableMemory/>` + `<ProgramMemoryTable/>`, then the pipeline slot and
editor.

Each table component **already renders sibling chrome around its `<SimulatorTable/>`**,
which is where an on-top toolbar would live:
- **Registers** — `RegisterTable.tsx:255-303`: `<SimulatorTable/>` (`:265-272`) plus an
  absolutely-positioned collapse arrow `ArrowBigLeftDash#closeRT` (`:273-278`) and a
  yellow "registers" re-open strip when collapsed (`:282-302`).
- **Data memory** — `AvailableMemory.tsx:260-334`: `<SimulatorTable/>` (`:270-282`) plus
  a **hover menu** (`HoverCard`, `:283-310`) already containing two actions ("Toggle
  Binary", "Hide Table") — a real per-table widget region — and a blue "memory" strip.
- **Program memory** — `ProgramMemory.tsx:181-241`: `<SimulatorTable/>` (`:191-200`) plus
  collapse arrow (`:201-207`) and blue "program memory" strip.

So there **is already a per-table header region** (the absolutely-positioned top-right
controls / the data-memory hover menu). A search box would be a sibling in that same
relative-positioned container, above or overlapping the SimulatorTable wrapper. There is
**no** search input in any of these today — search lives only in the side `SearchSection`.

### 3.6 Handle methods related to search/filter, and callers

From `SimulatorTable.tsx` (interface `:25-60`, impl in `makeHandle` `:177-245`):

| Handle method | Impl | Current caller(s) |
|---|---|---|
| `setFilter(predicate)` | `:194` (`instance.setFilter(predicate)`) | `ProgramMemory.tsx:162`, `AvailableMemory.tsx:235` |
| `clearFilter()` | `:197` (`instance.clearFilter(true)`) | `ProgramMemory.tsx:159`, `AvailableMemory.tsx:232` |
| `filterRegisters(search, theme)` | `:234` (`filterTableData(...)`) | `RegisterTable.tsx:229` |
| `clearRegisterFilter()` | `:237` (`clearFilter(true)` + `resetCellColors`) | `RegisterTable.tsx:227` |

The register-specific pair (`filterRegisters`/`clearRegisterFilter`) is the escape the
open ticket `.scratch/register-search-declarative/issues/01-declarative-register-search.md`
wants to delete — replacing it with generic `setFilter(predicate)` + a `rowFormatter`
highlight (`:11-19`). That ticket **overlaps** this toolbar work: whichever way the
toolbar drives the filter (Option B handle vs Option C prop), the register highlight
question (`filterTableData`) rides along, and the ticket's "does search scope stay
register-only, or unify with the memory search-scope item" open decision (`:39-40`) is
the same scope split this toolbar resolves for memory.

### 3.7 Summary of the mapping

- Search inputs are **global** (`SearchSection`), feeding **context** state
  (`searchInRegisters` on `RegisterTableContext`; `searchInMemory` on
  `MemoryTableContext`).
- **Register** search already targets one table but via a **handle escape**.
- **Memory** search targets **two** tables because they share **one** context string.
- Each table already owns local top-right chrome; none of it is a search box today.
- Moving each search input into its owning table's chrome and feeding a **local**
  search term (instead of shared/global context) is what "per-table search toolbar,
  scoped to that table only" means, and it directly fixes the shared-`searchInMemory`
  two-table span.

---

## Open questions

1. **Docs not fetchable.** <https://tabulator.info/docs/6.3/*> returns HTTP 403 to
   WebFetch, so the *prose* of the official Header-Filter / Filter / Layout pages was not
   read directly; all Tabulator behavior above is grounded in the installed v6.3.1
   source. If exact doc wording is required (e.g. the recommended header-filter UX), fetch
   from a browser or an authenticated tool.
2. **`headerFilter` column-option registration line.** `headerFilterFunc`,
   `headerFilterPlaceholder`, etc. are registered at `Filter.js:33-38`; the base
   `headerFilter` option is consumed in `initializeColumn` (`:335-361`) — confirm the
   precise `registerColumnOption("headerFilter")` call site if a citation to the
   registration (vs. consumption) is needed.
3. **Register per-cell highlight under a row filter.** Whether the current matching-cell
   background highlight (`filterTableData`) must be preserved, dropped, or reimplemented
   as a `rowFormatter` is an open product decision carried by the
   `register-search-declarative` ticket (`:37-40`), not settled here.
4. **One toolbar for the two memory tables vs. one each.** The data-memory and
   program-memory tables are visually adjacent (`#memoryTables`, `Tables.tsx:19-23`) and
   share `searchInMemory` today. Whether the redesign gives each its own toolbar
   (true per-table scope) or keeps a single memory-region toolbar is a UX decision the
   source cannot answer.
5. **Header filters vs single search box.** Whether the desired UX is one free-text bar
   (function filter, Option B/C) or per-column header inputs (Option A) is a product
   choice; only Option A is achievable with zero SimulatorTable/handle change.

---

## UI direction (weak leaning — NOT a decision)

Recorded 2026-07-29 from a quick look at ASCII mockups, not from a grill. Treat as a
**starting bias to challenge**, not a settled choice — the user self-describes as not
confident in UI design, so this is deliberately soft.

- **Leaning:** a **magnifier icon in each table's existing top-right header chrome
  (by the collapse arrow) that expands into a search input on click, with an `✕` to
  clear**. Tidy at rest, one search scoped to that one table.
- **Why it's only a leaning:** picked on looks alone, no interaction/edge cases worked.
  Alternatives still live — an always-visible header search box (simpler, no toggle
  state), or Tabulator-native per-column header filters (§1, zero handle change).
- **Mechanism is orthogonal to the icon:** whichever shape wins, behind it is still
  filter-based (Tabulator has no search widget, §1). The icon toggles a **local**
  `searchTerm` that feeds `setFilter` — replacing the shared
  `MemoryTableContext.searchInMemory` that causes the two-table span (§3).
- **Open before this firms up** (for `/grill-with-docs`): debounce vs instant; which
  fields match; whether register search folds into the same shape (overlaps
  `register-search-declarative`); one memory toolbar vs one-per-table (Open question 4);
  free-text box vs per-column header filters (Open question 5).

---

## Sources

**Repo (primary):**
- `docs/adr/0006-simulatortable-hides-tabulator.md`
- `CONTEXT.md:52-53` (SimulatorTable domain entry)
- `client/simulator/src/components/panel/Sections/Tables/SimulatorTable.tsx` (handle `:25-60`, impl `:177-245`, wrapper `:170-174`)
- `client/simulator/src/components/panel/Sections/SearchSection.tsx`
- `client/simulator/src/components/panel/Search/LocatePc.tsx`
- `client/simulator/src/components/panel/Search/SearchInRegistersTable.tsx`
- `client/simulator/src/components/panel/Search/SearchInMemoryTable.tsx`
- `client/simulator/src/components/panel/Sections/Tables/Tables.tsx`
- `client/simulator/src/components/panel/Sections/Tables/RegisterTable.tsx`
- `client/simulator/src/components/panel/Sections/Tables/MemoryTable/ProgramMemory.tsx`
- `client/simulator/src/components/panel/Sections/Tables/MemoryTable/AvailableMemoryTable/AvailableMemory.tsx`
- `client/simulator/src/context/shared/MemoryTableContext.tsx:57-58,85,115-116`
- `client/simulator/src/context/panel/RegisterTableContext.tsx:24-25,35,38`
- `client/simulator/src/utils/tables/handlersRegisters.ts` (`filterTableData` `:65+`)
- `client/simulator/src/utils/tables/handlersShared.ts` (`resetCellColors`)
- `.scratch/register-search-declarative/issues/01-declarative-register-search.md`
- `.scratch/manual/research/detail-panels.md` (style reference; §1.8, §4.1)

**Tabulator v6.3.1 installed source (primary):**
- `client/simulator/node_modules/tabulator-tables/package.json:6` (version)
- `.../src/js/modules/Filter/Filter.js` (table fns `:40-53`; header-filter col options `:33-38`, `headerFilterLiveFilterDelay` `:29`; `setFilter` `:599`, `addFilter` `:610`, custom-function branch `findFilter` `:641-646`, `clearFilter` `:772`, `clearHeaderFilter` `:783`, `getFilters/getHeaderFilters` `:686-732`, `setHeaderFilterValue` `:550`, header-filter init `:221-245,327-361,421,458-466`, default type `like`/`=` `:264,271`)
- `.../src/js/modules/Filter/defaults/filters.js:4-100` (built-in filter types)
- `.../src/js/core/FooterManager.js:38-93` (`footerElement` handling, `append`)
- `.../src/js/core/defaults/options.js` (`footerElement:29`, `headerVisible:37`, `placeholder:56`)
- Absence of any `toolbar` identifier: recursive grep over `src/js/modules/` + `src/js/core/`

**Tabulator docs (canonical URLs; returned HTTP 403 to automated fetch, not read directly):**
- <https://tabulator.info/docs/6.3/filter>
- <https://tabulator.info/docs/6.3/layout>
