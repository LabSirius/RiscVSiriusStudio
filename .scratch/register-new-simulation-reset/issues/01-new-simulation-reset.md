# Register reset on a new simulation — semantics to grill

Status: needs-triage
Type: grilling

Future ticket. Deferred from the SimulatorTable registers migration (ticket #3). The
migration preserved the existing reset behaviour byte-for-byte; the user flagged the
reset model itself as "something deep to grill in a future."

## Current behaviour (preserved by #3)

When `isCreatedMemoryTable` goes false (new simulation / initial state), the register
table resets: `setFixedchangedRegisters([])`, `setRegisterData(Array(32).fill('0'*32))`,
and rows rebuilt to 32 zeroed, unwatched, hex registers (`resetRegisterRows()` in
`components/panel/Sections/Tables/RegisterTable.tsx`).

## Why it needs grilling (open questions)

- Should a new simulation clear the **watched** set, or keep the user's watched
  registers pinned across runs?
- Should **viewType** (radix per register) reset to hex, or persist across runs?
- Is `isCreatedMemoryTable` the right trigger, or should reset key off an explicit
  "new simulation" signal? Today register reset piggybacks on the memory table's
  created flag, which couples the two tables.
- Values are produced from inside the program (import is unwanted — see below); confirm
  the reset source of truth is the program load, not the register table.

## Related deferred item

Register import (`importRegister` / `ImportRegister.tsx`) is unwanted per the user — all
register values come from the program. Removing that feature (UI button + context +
the import effect in RegisterTable) is a separate cleanup, to decide alongside this.

## Affected code

- `components/panel/Sections/Tables/RegisterTable.tsx` — the reset effect + import effect.
- `utils/tables/registerRows.ts` — `resetRegisterRows`.
- `context/shared/RegisterData.tsx`, `context/panel/RegisterTableContext.tsx`.
