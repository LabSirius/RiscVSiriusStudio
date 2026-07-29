# Handoff — SimulatorTable migration, ticket #3 (program-memory + registers)

## Where this sits

Architecture-review **candidate A**: collapse the three web-view tables (registers,
data-memory, instruction-memory) onto **one deep table module, `SimulatorTable`**,
which hides the Tabulator library behind a small declarative interface. Design was
grilled and settled; decisions recorded in **`docs/adr/0006-simulatortable-hides-tabulator.md`**
and the **`SimulatorTable`** entry in **`CONTEXT.md`** (Client-view-seam cluster).

Branch: **`refactor/simulatortable-foundation`** (off `main`).

### Done and committed
- **#1 `47c06973`** — foundation. `SimulatorTable.tsx`, `mergeOptions.ts`, one
  parameterized memory column builder (`memoryColumns.ts`, replacing 3 near-dup
  builders — old `getColumn*MemoryDefinitions` now delegate). Node tests. Behaviour-neutral.
- **#2 `c2ee8926`** — available-memory migrated. Collapsed `AvailableMemoryTable`
  + `AvailableHexMemoryTable` into one **`AvailableMemory.tsx`**; deleted 7 imperative
  hooks; added pure `availableRows.ts` (+tests). **Verified in the webview.**

### Left — ticket #3 (this handoff)
Migrate **program-memory**, then **registers**, onto `SimulatorTable`. Delete the
remaining dup lifecycle hooks. Registers is the interface stress-test.

## The `SimulatorTable` interface (read the file — `.../Tables/SimulatorTable.tsx`)

```
columns   ColumnDefinition[]              // Tabulator type crosses the seam by design (ADR-0006)
data      T[]                             // declarative; module diffs via setData on change
options?  Partial<Tabulator.Options>      // per-table escape: index, initialSort, groupBy,
                                          //   movableRows, rowFormatter — merged over owned defaults
onEdit?   (row, cell) => void             // cellEdited relay; caller sends the webview msg
onReady?  (handle) => void                // fired on tableBuilt
```
Handle (imperative view-only escape hatch, no raw instance leak):
`flashCells(index, fields, classNames, ms)`, `scrollToRow(index, pos)`,
`setFilter(pred)`, `clearFilter()`, `markPc(pcHex)`, `redraw()`, and a live
`columns`-prop swap effect (used for bin/hex).

Owned (never in `options`): create/destroy/build, the `data`→`setData` sync, the
`onEdit` relay. That's what keeps the module deep rather than a passthrough.

## The pattern to copy — `AvailableMemory.tsx`

Study it; #3 repeats the shape. Key moves:
- Byte/row data is **state** (`baseRows`), display rows via `useMemo` (labels applied
  purely). Mutations (write/import/resize) recompute the array → `setData`.
- Transient effects (write flash, read pulse, search, PC icon) go through the **handle**.
- `onReady` stores the handle in a ref **and** calls `setIsCreatedMemoryTable(true)`
  — other components (register table, program table) gate on that context flag. Keep it.
- Segment/label colouring via a `rowFormatter` in `options` (reads live refs for theme/SP).

## Hard-won gotchas (these cost iterations in #2 — don't rediscover)

1. **Declarative `setData` wipes DOM classes.** Any persistent cell styling (the
   "written" colour) must live in **row data + rowFormatter** (re-runs every redraw),
   NOT a class added via the handle — the next `setData` erases a handle-added class.
   See `writtenFields` on `AvailableRow` + the rowFormatter in `AvailableMemory`.
2. **Flash vs persist race.** A handle flash fires synchronously, *before* the
   `setData` re-render triggered by the same state update — so `setData` wipes it.
   Use the handle only for the transient pulse (`animate-cell`), let the rowFormatter
   own anything that must persist.
3. **Theme reflow.** A theme toggle changes no data, so no redraw → stale colours.
   rowFormatter must clear *both* theme variants then apply the current one, and an
   effect on `theme` calls `handle.redraw()`.
4. **Gated behaviours** (easy to mis-read as bugs): memory **search** is off until
   `newPc > 0` (must step once); inline **edit** needs `!isFirstStep` + a writable
   segment (program/read-only rows stay locked). The `editable` predicate reads
   `isFirstStepRef.current` live — keep the ref synced, no need to rebuild columns.
5. **Deletions are staged by `git rm`**; don't re-`git add` a removed path (errors).

## Program-memory specifics

- Component `.../MemoryTable/ProgramMemory.tsx`. Columns already available:
  `buildMemoryColumns("program", ref)` (Info / Addr. / Instruction encoding / HEX).
- Row source: `uploadProgramMemory` in `utils/tables/handlersMemory.ts` — extract a
  pure `buildProgramRows(program, symbols, typesInstruction)` (mirror of `buildAvailableRows`;
  rows carry `instructionencoding` = coloured HTML via `colorizeInstruction`, `segment:"program"`,
  symbol labels in `info`). Node-test it.
- Behaviours to route: **PC icon** on the current-PC row (was a `rowFormatter` +
  `useProgramCounterEffect`/`useLocatePcEffect` → use `handle.markPc`); **instruction
  tooltips** (`setupInstructionTooltips`, hover `.riscv-segment`); **address cellClick →
  jump** (`setClickAddressInMemoryTable` + `sendMessage clickInInstruction` +
  `animateArrowBetweenCells` for the jump arrow) — cellClick can stay a column
  callback or an option. Program memory is **read-only** (no byte writes).
- Program hooks to delete after: `programMemory/useMemoryTabulator.ts`,
  `useProgramCounterEffect`, `useLocatePcEffect`, `useEditorClickAnimation` (fold into
  the component). Shared `useMemorySearchFilterEffect`/`useSyncIsFirstStepRef` are also
  used here — see the deferred search-scope note before touching them.

## Registers specifics (the stress-test)

- Component `RegisterTable.tsx` — a **7-hook manifold**: `useResetRegistersOnNewSimulation`,
  `useGlobalKeyboardShortcuts`, `useTabulator`, `useRegisterUpdates`, `useImportRegisterData`,
  `useUpdateTableColumns`, `useTableFilter`.
- Columns: `getColumnsRegisterDefinitions(viewTypeFormatter, isFirstStep, theme)` — Name /
  Value / Type / Watched(hidden). Pass its output straight as the `columns` prop.
- **Divergent options — the real escape-prop test:** `groupBy: 'watched'`,
  `groupValues: [[true,false]]`, `groupHeader`, `movableRows: true`, `index: 'rawName'`,
  and today `reactiveData: true`. Under `SimulatorTable` there is **no reactiveData** —
  register writes/watched-toggles become `data` updates → `setData` (which re-groups).
  Verify grouping + movable rows survive `setData`.
- Data row shape: `registersNames.map((name,id) => { name, rawName, value, viewType:16,
  watched:false, modified:0, id })`.
- Behaviours: cell edit on `value` → pad to 32 bits → `setRegisterData` +
  `sendWebviewMessage registersChanged` (use `onEdit`); write animation + `scrollToRow`
  + auto-watch grouping (`useRegisterUpdates`) → `handle.flashCells`/`scrollToRow` +
  set `watched:true` in data; filter (`useTableFilter`) → `handle.setFilter`; viewType/
  theme/isFirstStep change → the column swap effect (pass fresh `columns`).
- **Leave the radix hover-toggle (`attachConvertionToggle`, b/h/s/u/a) and `valueFormatter`
  as-is** — that radix logic is architecture-review **candidate B (`Word`)**, a separate
  future deepening. #3 only moves the table lifecycle, not the radix representation.

## Verification (no jsdom in this repo — vitest is `environment: "node"`)
- Pure seams: node tests (mirror `availableRows.test.ts` / `memoryColumns.test.ts`).
- `npx tsc -b` clean, `npx vitest run` green, `npm run build` (tsc + vite) clean.
  The CSS `Unexpected ")"` minify warning is pre-existing/unrelated.
- **DOM behaviour can only be verified in the running webview** — hand the checklist to
  the user (program: PC icon, tooltips, jump arrow, symbol labels, search; registers:
  edit+pad, write animation+auto-watch, watched grouping, movable rows, filter, viewType
  switch, theme). Commit each table as its own revertible commit after they verify.

## Deferred polish (logged, NOT part of #3 unless you choose)
- Shared `searchInMemory` filters BOTH available + program tables at once (awkward).
  Decide program's own search scope while migrating program memory.
- Optionally colour a byte on manual inline edit (treat edit like a write). Original didn't.

## Relevant memories
- Client `tsc -b` breaks if you import `@protocol/datapath-view` into the client (pulls
  repo `src/` errors). Not needed for tables, but don't reach for it.
- No em dashes in prose the user reads (their writing preference).
