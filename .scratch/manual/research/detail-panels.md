# Detail panels of the simulator webview — source-grounded research

Research notes for the user-manual chapter covering the **lower detail panels** of the
RiscVSiriusStudio webview simulator. Notes are in English; the manual itself is Spanish/Quarto.

All paths are relative to repo root `/home/gg/Documents/RiscVSiriusStudio`. Line numbers refer
to the state of the tree at the time of writing.

> Scope note: this covers the **UI/behavior side** only (`client/simulator/src/`). Execution-engine
> internals in `src/vcpu/` are deliberately out of scope. Where the source does not confirm a
> behavior, it is listed under **Open questions**, not guessed.

---

## 0. Overview / how the panels are laid out

The lower area of the simulator is a single horizontal strip of tables plus an optional assembly
editor. The row is assembled in `Tables.tsx`:

- `client/simulator/src/components/panel/Sections/Tables/Tables.tsx:16-35`
  renders, left-to-right:
  1. `RegisterTable` (register unit)
  2. `AvailableMemoryTable` (data memory, binary-byte view) **and**
     `AvailableHexMemoryTable` (data memory, HEX-only view) — only one visible at a time
  3. `ProgramMemoryTable` (program / instruction memory)
  4. a `display:contents` slot where the pipeline "stages" table portals in (ADR-0005)
  5. `ProgramSection` (Monaco assembly editor) — **only** when `modeSimulator !== "text"`
     (`Tables.tsx:33`).

The whole strip lives inside `MainSection`, which horizontally scrolls
(`overflow-x-auto`) and only shows the tables when `operation` is `"uploadMemory"` or `"step"`
(`client/simulator/src/components/panel/Sections/MainSection/MainSection.tsx:55-60`). A "scroll the
mouse" hint icon flashes for 1 s when the window is narrower than 1296 px in those operations
(`MainSection.tsx:22-49,87-93`; icon = `components/panel/MouseScrollIcon.tsx`).

**Each of the three tables can be collapsed** into a thin vertical tab (a `ArrowBigLeftDash` hides
it; a colored vertical strip with `ArrowBigRightDash` and the stacked table name re-opens it).
This is per-table local state:
- Registers: `showTable` state, yellow strip labeled "registers"
  (`RegisterTable.tsx:40,130-158`).
- Data memory (binary): `showTable`, blue strip "memory"
  (`AvailableMemoryTable.tsx:58,169-206`).
- Data memory (hex): `showTable`, blue strip "memory" (`AvailableHexMemoryTable.tsx:70,175-208`).
- Program memory: `showProgramTable` from `MemoryTableContext`, blue strip "program memory"
  (`ProgramMemory.tsx:35,112-149`; context default `false` at `MemoryTableContext.tsx:98`).
- Assembly editor: `showEditor`, strip "assembly" (`ProgramSection.tsx:30,191-226`).

All tables are [Tabulator](https://tabulator.info) instances styled through
`Sections/Tables/tabulator.css` and theme classes `theme-light` / `theme-dark`.

---

## 1. Register unit — features beyond the documented columns/Watched

Component: `components/panel/Sections/Tables/RegisterTable.tsx`
Table lifecycle: `hooks/text/registers/useTabulator.ts`
Column defs: `utils/tables/definitions/definitionsColumns.ts` (`getColumnsRegisterDefinitions`)
Cell formatters/editors: `utils/tables/definitions/handlerDefinitions.ts`

### 1.1 The 32 registers and their names
- Fixed list of 32 registers with ABI aliases: `x0 zero … x31 t6`
  (`components/panel/Sections/constants/data.ts:2-7`).
- The Name column formatter renders `x<N> (abi)`, e.g. `x2 (sp)`
  (`handlerDefinitions.ts:27-31`).

### 1.2 Watched / Unwatched grouping and click-to-move (confirm existing docs)
- Table is grouped by the boolean `watched` field; group headers read
  `Watched (N registers)` / `Unwatched (N registers)`
  (`useTabulator.ts:90-92`).
- Clicking the **Name** cell toggles `watched` and re-groups, moving the row between sections
  (`definitionsColumns.ts:42-47`).
- Rows are draggable (`movableRows: true`, `useTabulator.ts:93`).

### 1.3 Type column tag + collapse arrow icon (extends existing docs)
- The Type column shows a compact tag, not the literal format word:
  `2 → "bin"`, `unsigned → "10"`, `signed → "±10"`, `16 → "hex"`
  (`handlersRegisters.ts:69-76`). ASCII falls through to `String(viewType)` = "ascii".
- Each Type cell renders a small down-chevron icon; clicking it opens the editor
  (`handlersRegisters.ts:83-106`).
- The Type column is a Tabulator `list` editor whose options are `possibleViews`
  = `[2, 'signed', 'unsigned', 16, 'ascii']`
  (`definitionsColumns.ts:63-71`, `constants/data.ts:8`). Editing it reformats the row so the
  Value cell re-renders in the new format (`definitionsColumns.ts:69`).

### 1.4 Per-register format override vs. global — there is NO global; each row is independent
- Every register starts at `viewType: 16` (hex) at build time (`useTabulator.ts:77`).
- Changing the **Type** cell changes only that row's persistent display format — it is
  per-register, there is no single global format switch. (`definitionsColumns.ts:62-71`.)

### 1.5 Editing register values (answer: yes, editable)
- The **Value** cell is editable except: (a) during the first step (`isFirstStep`), and
  (b) for `x0 zero`, which is never editable (`definitionsColumns.ts:22-32`).
- Editor = `valueRegisterEditor` (`handlerDefinitions.ts:60-119`):
  - The input is **pre-filled in the register's current viewType** (hex/signed/unsigned/ascii),
    except binary which shows the raw 32 bits (`handlerDefinitions.ts:70-74`).
  - **Binary editing is special**: keystrokes are constrained to `0`/`1`; typing shifts the
    32-bit string left one bit and appends the new bit; Backspace/Delete prepends a `0` and drops
    the last bit — i.e. it always keeps exactly 32 bits (`handlerDefinitions.ts:92-108`).
  - Validation per type before commit: binary must be 32 chars of 0/1; unsigned/signed/hex/ascii
    validated by the corresponding `valid*` helpers; invalid input turns the border red and is
    rejected (`handlerDefinitions.ts:76-88,121-137`).
  - Commit on Enter or blur; Escape cancels (`handlerDefinitions.ts:101-116`).
- On commit, the value is left-padded to 32 bits and written to global register state, and a
  `registersChanged` message is sent to the extension (`useTabulator.ts:105-121`).
- Programmatic writes (from the engine) animate the register cell and auto-scroll to it
  (`handlersRegisters.ts:19-61`): rows x0–x12 scroll to center, x13+ scroll to top.

### 1.6 Momentary "peek" conversion on the Value cell (NOT documented — important)
Distinct from the persistent Type change. Hovering a **Value** cell and *holding* a letter key
temporarily re-renders that one cell in another base, and simultaneously swaps the Type tag label;
releasing the key restores the original (`handlerDefinitions.ts:156-277`, wired via
`cellMouseEnter → attachConvertionToggle`, `definitionsColumns.ts:58-60`):
- `b` → binary, `h` → hex, `s` → signed (shows `signed / unsigned` when they differ),
  `u` → unsigned, `a` → ascii (`handlerDefinitions.ts:189-218`).
- Suppressed while an editor input is open (`handlerDefinitions.ts:176-181`).
- This peek does **not** change stored format (documented to the user in
  `ExampleShortcuts.tsx:21-33`).

### 1.7 Persistent type change by hovering the Type cell + key (NOT documented)
Hovering the **Type** tag cell and pressing `b/h/s/u/a` **permanently** sets that register's
viewType (via a global keydown handler that targets the currently hovered Type cell):
- Handler `handleGlobalKeyPress` maps `b→2, s→signed, u→unsigned, h→16, a→ascii`
  (`handlersRegisters.ts:113-131`).
- Wiring: `useGlobalKeyboardShortcuts` + the hovered-cell ref maintained by the Type formatter
  (`RegisterTable.tsx:47-58,66-69`; `hooks/text/registers/useGlobalKeyboardShortcuts.ts`).
- User-facing description at `ExampleShortcuts.tsx:36-50`.

### 1.8 Search / filter of the register table (NOT documented)
Fed by the Search side-panel input ("Search in registers table"), stored in
`RegisterTableContext.searchInRegisters`, applied by `useTableFilter`
(`RegisterTable.tsx:108-113`; `hooks/text/registers/useTableFilter.ts`;
`components/panel/Search/SearchInRegistersTable.tsx`). Placeholder shows the accepted forms:
`e.g x17 or 12 or 1100 or 0xC`.
- Logic in `filterTableData` (`handlersRegisters.ts:143-233`):
  - `0x…` → parses hex, converts to a binary substring, filters/highlights Value cells that
    contain those bits.
  - Pure binary string → matches on both name and value (as decimal-from-binary and 32-bit padded).
  - Decimal (incl. negatives via 8-bit two's complement) → matched against name and value.
  - Otherwise plain substring match on name/value.
- Matching cells are highlighted (`#3A6973` dark / `#D1E3E7` light); clearing the box removes the
  filter and resets colors (`useTableFilter.ts:32-37`, `handlersShared.ts` `resetCellColors`).

### 1.9 "Automatically add changing registers to the watch list" (Setting; NOT documented)
`checkFixedRegisters` (default **on**, `CustomOptionSimulate.tsx:22`). When on, any register the
engine writes is auto-added to Watched and the table re-groups and scrolls to it
(`useRegisterUpdates.ts:47-57,81-96`). Toggle UI: `SwitchSeeRegistersChanged.tsx` (label
"Automatically add changing registers to the watch list.").

### 1.10 Import / Export registers (NOT documented)
- Export: `ExportRegisters.tsx` writes the 32 binary strings, one per line, to `registers.txt`.
- Import: `ImportRegister.tsx` reads a `.txt`; validates exactly 32 lines, each 32 chars of 0/1,
  and x0 must be all zeros; errors surface in a modal `Dialog`. On success it repopulates the
  table (viewType reset to binary) and sends `registersChanged` (`ImportRegister.tsx:18-86`).

### 1.11 Collapse arrow
Left-arrow (`ArrowBigLeftDash`, id `closeRT`) hides the table into a yellow "registers" strip
(`RegisterTable.tsx:130-158`).

---

## 2. Program memory panel (Memoria de programa / instruction memory table)

Component: `components/panel/Sections/Tables/MemoryTable/ProgramMemory.tsx`
Lifecycle: `hooks/text/memory/programMemory/useMemoryTabulator.ts`
Columns: `definitionsColumns.ts` (`getColumnProgramMemoryDefinitions`, lines 218-278)
Row population: `handlersMemory.ts` (`uploadProgramMemory`, lines 199-267)

### 2.1 Columns (4 visible + 1 hidden)
From `getColumnProgramMemoryDefinitions` (`definitionsColumns.ts:241-274`):
1. `index` — hidden.
2. **Info** (width 60) — label chip column (symbols; PC/SP labels reuse this pattern). Empty cells
   get an invisible placeholder (`handlersMemory.ts:258-264`). Has a hover tooltip
   (`createTooltip`).
3. **Addr.** (width 75) — the byte address in uppercase hex; sortable numerically; default sort is
   descending so address `0` sits at the bottom (`useMemoryTabulator.ts:88`,
   `definitionsColumns.ts:254-264`).
4. **Instruction encoding** (width 340, right-aligned) — the 32-bit instruction, **field-colorized**
   by instruction type (see 2.3).
5. **HEX** (width 110) — the 4 bytes as `HH-HH-HH-HH` uppercase (`handlersMemory.ts:221-229`).

Note the difference from the data-memory table, which has per-byte `0x3..0x0` columns instead of a
single "Instruction encoding" column.

### 2.2 What each row shows / where it comes from
- Program bytes come from `dataMemoryTable.program`, chunked into 4-byte words
  (`useMemoryTabulator.ts:93-104`, `handlersMemory.ts:207-233`). The 4 bytes are assembled
  little-endian into a 32-bit string for display (`handlersMemory.ts:212`).
- The instruction **type** for coloring comes from `typesInstruction[index].type`
  (`handlersMemory.ts:214`, e.g. "R","I","S","B","U","J").
- There is **no decoded mnemonic / disassembly column** in this table. The human-readable assembly
  lives in the separate assembly editor (`ProgramSection`) and in the data model's `asmList`
  (`MemoryTableContext.tsx:16`), not in a program-memory column. (See Open questions.)

### 2.3 Instruction-encoding colorization + per-field tooltips (NOT documented)
`colorizeInstruction` (`handlersMemory.ts:124-197`) splits the 32 bits by RISC-V format and wraps
each field in a colored span with a `data-tooltip` naming the field:
- R/I/S/B/U/J types each get their own field layout (opcode, rd, funct3, rs1, rs2, funct7, imm…).
- Colors: opcode red, rd orange, rs1 yellow, rs2 green, funct3 teal, funct7 slate, imm purple
  (`main.css:546-552`).
- Hovering a field shows a floating tooltip with the field name (`setupInstructionTooltips`,
  `handlersMemory.ts:270-304`; wired at `useMemoryTabulator.ts:106`).
- Unknown types fall back to plain 4-bit-grouped bits (`handlersMemory.ts:184-185`).

### 2.4 Current-instruction (PC) highlight
- A "locate" crosshair icon (`createPCIcon`, `handlersMemory.ts:312-329`) is appended to the Addr.
  cell of the row whose address equals `PC*4`, both in the row formatter
  (`useMemoryTabulator.ts:69-87`) and on every PC update (`updatePC`, `handlersMemory.ts:331-369`).
- The PC row flashes (`animate-pc`) and the table auto-scrolls to it on update
  (`updatePC` end; `useProgramCounterEffect.ts`).

### 2.5 Labels / symbols
- Symbols (`dataMemoryTable.symbols`) become teal chips in the **Info** column at the symbol's
  address; if no row exists at that address a placeholder row is added
  (`handlersMemory.ts:239-256`).

### 2.6 Click behavior — jump-to-editor and jump-arrow (NOT documented)
Clicking an **Addr.** cell (`useMemoryTabulator.ts:108-131`):
- Resolves the line via `dataMemoryTable.addressLine[addr/4]`, highlights that line in the editor
  (`setClickAddressInMemoryTable`) and sends `clickInInstruction` to the extension.
- If that instruction is a branch/jump (`.jump`), it draws an animated SVG arrow from the current
  address cell to the computed target address cell (`animateArrowBetweenCells`,
  `handlersMemory.ts:588-673`).

### 2.7 Search + Locate PC apply here too
- The "Search in memory table" input filters this table by any field
  (`useMemorySearchFilterEffect`, `ProgramMemory.tsx:73-78`; `filterMemoryData`,
  `handlersMemory.ts:454-475`).
- "Locate PC" button scrolls this table to the PC row (`useLocatePcEffect.ts`;
  `Search/LocatePc.tsx`).

### 2.8 Editing
- Column def marks encoding cells editable via `binaryMemEditor`, but only outside the first step
  and only for non-code segments; program rows have `segment === 'program'`, so in practice program
  instructions are **not** user-editable (`definitionsColumns.ts:228-239`, segment set at
  `handlersMemory.ts:210`). (See Open questions — worth screenshot verification.)

---

## 3. Program panel (Programa / running program view) — the assembly editor

Component: `components/panel/Sections/ProgramSection.tsx`. Collapsed-strip label is "assembly".

### 3.1 What it shows
- A **read-only Monaco editor** displaying the full assembly source `textProgram`
  (`ProgramSection.tsx:166-187`; `readOnly: true` at line 174).
- Source text arrives from the extension via the `textProgram` message
  (`hooks/useMessageListener.ts:72-73`, `SimulatorContext`).
- Language is set to `"python"` purely for syntax coloring (`defaultLanguage="python"`,
  line 168); minimap off, line-highlight off, horizontal scrollbar hidden, no glyph margin
  (`ProgramSection.tsx:173-186`).
- Custom transparent themes `my-custom-light` / `my-custom-dark` so the editor blends into the
  panel background (`ProgramSection.tsx:131-157`).
- Only mounted in graphic mode (`Tables.tsx:33`, `modeSimulator !== "text"`).

### 3.2 Current-line highlight (retiring instruction)
- The line of the instruction that retired this clock is `highlightedLine` from **ShellContext**
  (the Cycle-effect signal, ADR-0004/0005; `context/shell/ShellContext.tsx:30-34`).
- When set (`!= -1`) the editor whole-line-decorates it with class
  `highlighted-line driver-first-valid-line` — a translucent teal band
  (`ProgramSection.tsx:57-83`; CSS `main.css:227-229`).
- If the "auto-focus new line" setting is on, the editor also scrolls that line into view
  (`ProgramSection.tsx:75-77`).

### 3.3 Breakpoints
- **No breakpoint feature exists** in this editor. `glyphMargin` is disabled and there is no gutter
  click handler for breakpoints. (See Open questions.)

### 3.4 Click behavior / relation to the memory table (bidirectional)
- Clicking a line: `onMouseDown` captures the line number into `clickInEditorLine`
  (`ProgramSection.tsx:124-128`). That drives `useEditorClickAnimation` to flash the matching
  program-memory row and, if it's a jump, draw the jump arrow
  (`hooks/text/memory/programMemory/useEditorClickAnimation.ts`).
- Reverse direction: clicking an address in the program-memory table sets
  `clickAddressInMemoryTable`, which scrolls the editor to that line and shows a transient orange
  arrow-shaped margin marker for ~1 s (`ProgramSection.tsx:87-119`; CSS
  `.address-margin-decoration` `main.css:231-237`).
- Horizontal wheel scrolling is forwarded to the surrounding scroller so the whole strip pans
  (`ProgramSection.tsx:33-55`).

---

## 4. Utility / side panel

The left sidebar (`components/panel/Sidebar/SideBar.tsx`) is an icon rail that hover-expands. It
switches `section` in `SimulatorContext`; `MainSection` renders the matching section panel
(`MainSection.tsx:61-85`). Availability of each icon depends on `operation`:

| Icon | section | Shown when (`SideBar.tsx:42-58`) |
|---|---|---|
| Search (magnifier) | `search` | operation not `""` and not `"uploadMemory"` (i.e. during `step`) |
| Calculator | `convert` | always |
| Settings (gear) | `settings` | operation `"uploadMemory"` or `"step"` |
| Info | `help` | always (bottom of rail) |

An active-section dot (`CircleActive`) marks the current section (`SideBar.tsx:31`).

> Note: which section actually renders is gated again in `MainSection` per operation
> (`MainSection.tsx:61-85`): in `uploadMemory` the choices are settings / convert / help; in
> `step`, search / convert / settings / help.

### 4.1 Search section (`components/panel/Sections/SearchSection.tsx`)
Three controls stacked (`SearchSection.tsx:10-17`):
- **Locate PC** button — scrolls memory/program tables to the current PC
  (`Search/LocatePc.tsx`; sets `locatePc` → `useLocatePcEffect`).
- **Search in registers table** — text input; placeholder `e.g x17 or 12 or 1100 or 0xC`; feeds
  register filter (see §1.8) (`Search/SearchInRegistersTable.tsx`).
- **Search in memory table** — text input; placeholder `e.g 1234`; feeds memory filter (§2.7)
  (`Search/SearchInMemoryTable.tsx`).
- Footer hint: "If you have any question, click on the information icon."

### 4.2 Settings section (`components/panel/Sections/SettingsSection.tsx`)
Contents depend on operation (`SettingsSection.tsx:12-33`):
- **`uploadMemory` → ManualConfig** (`Settings/ManualConfig/ManualConfig.tsx`):
  - Hint to press the "step" button to execute the first instruction.
  - **Import data**: Import Registers + Import Memory buttons
    (`ImportRegister.tsx`, `ImportMemory.tsx`).
  - **Memory size (in bytes)** input: validated 16–512, multiple of 4
    (`Settings/MemorySizeInput.tsx:15-21`).
- **`step` → StepConfig** (`Settings/Step/StepConfig.tsx`): the Memory-size input, **disabled**
  (can't resize memory mid-run).
- **Export data** (always): Export Registers (`registers.txt`) + Export Memory buttons
  (`Settings/Step/ExportRegisters.tsx`, `ExportMemory.tsx`).
- **Custom options** (always):
  - `SwitchSeeRegistersChanged` — "Automatically add changing registers to the watch list."
    (default on; §1.9).
  - `SwitchAutoFocusOnNewLine` — "Move focus to each new program line automatically." (default on;
    drives editor auto-scroll, §3.2) (`Settings/SwitchAutoFocusOnNewLine.tsx`;
    `CustomOptionSimulate.tsx:25`).

Import formats (for the manual):
- Registers `.txt`: 32 lines, each exactly 32 binary chars; x0 must be all zeros
  (`ImportRegister.tsx:32-64`).
- Memory `.txt`: lines of `HEXADDR:32BIN`; address must be ≤ sizeMemory−4; value 32 binary chars
  (`ImportMemory.tsx:31-57`).

### 4.3 Convert section (`components/panel/Sections/ConvertSection.tsx`)
A standalone base converter (always available). Formats: **Two's complement, Hexadecimal, Decimal,
ASCII** (`ConvertSection.tsx:9-14`).
- Two From/To dropdowns (`Convert/Dropdown.tsx`), a value input, a live result field, a swap
  button, and a copy button.
- When From = Two's complement, the input is a masked 32-bit binary field (grouped in 4s), with a
  "Fill with ones (negative)" checkbox controlling sign padding
  (`ConvertSection.tsx:23-33,114-128`; masking in `convert.ts:processTwoComplementInput`).
- Conversion math in `utils/tables/convert.ts:convertValue` (hex/dec/two's-comp/ascii, incl.
  signed vs unsigned decimal display `signed / unsigned`).
- Copy button: for non-binary targets copies the result directly; for Two's-complement target it
  opens a small menu to copy **32 / 16 / 8** low bits (`Convert/CopyButton.tsx:39-54`).
- Swap button exchanges From/To and clears fields (`ConvertSection.tsx:49-59`).

### 4.4 Help section (`components/panel/Sections/HelpSection.tsx`)
- A link "RISC-V instructions reference" (sends `clickOpenRISCVCard` to the extension).
- "Show tutorial" link (only once an operation is active) — triggers the Driver.js tutorial
  (`setShowTuto(true)`; `hooks/useTutorial.ts`).
- Body varies by operation (`HelpSection.tsx:28-30`):
  - default (no sim) → `FirstHelp` carousel: use a `.asm` file, press play, press CPU icon.
  - `uploadMemory` → `SettingsHelp`: import-data examples (register/memory tabs) + shortcuts card.
  - `step` → `LastHelp`: shortcuts card + "Search in tables" carousel.
- **Shortcuts reference card** (`Help/SettingsHelp/ExampleShortcuts.tsx`) documents the momentary
  `b/h/s/u/a` peek keys and (for registers) the persistent view-type keys — matches §1.6–1.7.

### 4.5 Modal dialog (`components/panel/Dialog.tsx`)
Shared `AlertDialog` used for errors (e.g. bad import files) and for the reset / choose-CPU prompt.
When `dialog.isReset`, it offers a **Monocycle / Pipeline(Beta)** radio choice and, on Accept,
sends the chosen type to the extension (`Dialog.tsx:62-101`). Also `ChangeTypeSimulator.tsx`
provides a separate refresh-icon modal to re-pick Monocycle/Pipeline.

---

## 5. Shared table behaviors (common across register + memory tables)

- **Collapse to a labeled strip** — all lower tables and the editor (see §0).
- **Momentary base-peek on hover + key** — registers use `attachConvertionToggle`
  (`handlerDefinitions.ts:156-277`); both memory tables use `attachMemoryConversionToggle`
  (`handlerDefinitions.ts:350-454`). Memory value cells accept `b/h/s/u/a`; the **Addr.** cell
  accepts `b/s/u` (binary / signed / unsigned of the address). Suppressed while any editor input
  is open.
- **Cell tooltips** in memory Info cells (`createTooltip`, `handlerDefinitions.ts:323-342`).
- **`monospace` styling** and theme classes (`theme-light`/`theme-dark`) everywhere
  (`definitionsColumns.ts` defaultAttrs; container classes in each table component).
- **Written / read animation**: engine writes flash cells and mark them "written"
  (`written-cell` teal / `written-cell-dark`), reads flash without the written color
  (`handlersMemory.ts:486-571`; CSS `main.css:200-216`). This confirms the existing
  "written-memory highlighting" doc and extends it to a distinct *read* animation.
- **Hamburger menu on the data-memory tables** (`AvailableMemoryTable.tsx:149-179`,
  `AvailableHexMemoryTable.tsx:158-183`): a hover card with two actions — **Toggle Binary**
  (switches between the full binary-byte table and the HEX-only table via shared `withBin` state in
  `Tables.tsx:14`) and **Hide Table**. NOTE: the two "AvailableMemory" components are two *views* of
  the same data (binary 7-col vs. hex-only), toggled by `withBin`, not two separate memories.
- **Search filters** share the side-panel inputs and highlight matches
  (register: `filterTableData`; memory/program: `filterMemoryData`).

---

## 6. Component map

| Panel / feature | Component (path) | Key logic (path) |
|---|---|---|
| Register table | `components/panel/Sections/Tables/RegisterTable.tsx` | `hooks/text/registers/useTabulator.ts`; `utils/tables/definitions/definitionsColumns.ts` (`getColumnsRegisterDefinitions`) |
| Register value formatting/editing | — | `utils/tables/definitions/handlerDefinitions.ts` (`valueFormatter`, `valueRegisterEditor`) |
| Register peek/type keys | — | `utils/tables/handlersRegisters.ts` (`attachConvertionToggle` in handlerDefinitions; `handleGlobalKeyPress`) |
| Register filter | `components/panel/Search/SearchInRegistersTable.tsx` | `utils/tables/handlersRegisters.ts` (`filterTableData`); `hooks/text/registers/useTableFilter.ts` |
| Register import/export | `Settings/ManualConfig/ImportRegister.tsx`, `Settings/Step/ExportRegisters.tsx` | — |
| Data memory (binary, 7 col) | `.../MemoryTable/AvailableMemoryTable/AvailableMemoryTable.tsx` | `hooks/text/memory/availableMemory/useMemoryTabulator.ts`; `getColumnMemoryDefinitions` |
| Data memory (HEX only) | `.../AvailableMemoryTable/AvailableHexMemoryTable.tsx` | `hooks/text/memory/availableMemory/UseHexAvMemoryTabulator.ts`; `getColumnHexMemoryDefinitions` |
| Program memory | `.../MemoryTable/ProgramMemory.tsx` | `hooks/text/memory/programMemory/useMemoryTabulator.ts`; `getColumnProgramMemoryDefinitions`; `handlersMemory.ts` (`uploadProgramMemory`, `colorizeInstruction`) |
| PC highlight / scroll | — | `handlersMemory.ts` (`createPCIcon`, `updatePC`); `useProgramCounterEffect.ts`, `useLocatePcEffect.ts` |
| Assembly editor (Programa) | `components/panel/Sections/ProgramSection.tsx` | `context/shell/ShellContext.tsx`; `hooks/text/memory/programMemory/useEditorClickAnimation.ts` |
| Sidebar rail | `components/panel/Sidebar/SideBar.tsx` | `SimulatorContext.section` |
| Section router | `components/panel/Sections/MainSection/MainSection.tsx` | — |
| Search section | `components/panel/Sections/SearchSection.tsx` | `Search/LocatePc.tsx` |
| Settings section | `components/panel/Sections/SettingsSection.tsx` | `Settings/ManualConfig/ManualConfig.tsx`, `Settings/Step/StepConfig.tsx`, `Settings/MemorySizeInput.tsx` |
| Setting switches | `Settings/SwitchSeeRegistersChanged.tsx`, `Settings/SwitchAutoFocusOnNewLine.tsx`, `Settings/SwitchShowHexCol.tsx` | `context/shared/CustomOptionSimulate.tsx`, `MemoryTableContext.tsx` |
| Convert section | `components/panel/Sections/ConvertSection.tsx` + `Convert/*` | `utils/tables/convert.ts` |
| Help section | `components/panel/Sections/HelpSection.tsx` + `Help/*` | `hooks/useTutorial.ts` |
| Modal dialog | `components/panel/Dialog.tsx` | `context/panel/DialogContext.tsx` |
| Scroll hint icon | `components/panel/MouseScrollIcon.tsx` | `MainSection.tsx` |
| Contexts | `context/shared/MemoryTableContext.tsx`, `context/panel/RegisterTableContext.tsx`, `context/panel/LinesContext.tsx`, `context/shared/CustomOptionSimulate.tsx`, `context/shell/ShellContext.tsx` | — |

---

## 7. Open questions / needs screenshot verification

1. **Program-memory disassembly.** Confirmed there is no mnemonic column in the program-memory
   table; instructions display only as colorized 32-bit encoding + HEX. Is decoded assembly meant to
   be read from the adjacent editor only? Verify with a screenshot that the manual's "Memoria de
   programa" figure matches (Info / Addr. / Instruction encoding / HEX).
2. **Editability of program instructions.** Column defs allow a `binaryMemEditor`, but program rows
   carry `segment === 'program'` which disables editing. Confirm on screen that program-memory cells
   are truly non-editable (data-memory value cells *are* editable outside the first step).
3. **`SwitchShowHexCol` appears unused.** The component (`Settings/SwitchShowHexCol.tsx`, label
   "Display hexadecimal column in memory table.") and `toggleHexColumn`/`showHex` context state
   exist, but `SwitchShowHexCol` is not imported by `SettingsSection` or any mounted component
   (grep finds it only in its own file). The live hex/binary toggle is instead the hamburger
   "Toggle Binary" (`withBin`). Verify whether a "show hex column" switch is visible in the current
   UI before documenting it.
4. **Data-memory column-hiding hamburger option.** Existing docs mention a hamburger with
   "hide-columns". In current source the data-memory hamburger only exposes **Toggle Binary** and
   **Hide Table** (no per-column hide menu). Confirm whether the documented per-column hiding still
   exists or has been replaced by the binary/hex toggle.
5. **`useSyncWatchedRegisters.ts` is an empty file** — no behavior. Watched-list syncing is actually
   in `useRegisterUpdates.ts`. No manual impact; noted so nobody documents a phantom feature.
6. **Breakpoints.** Confirmed absent from the assembly editor (no glyph margin / gutter handler).
   If the manual has a "breakpoints" placeholder, it should be dropped or marked as not-implemented.
7. **Two data-memory tables vs. two memories.** Verify the screenshot shows a single data-memory
   region rendered either as 7 binary columns or as a single HEX column (toggle), not two separate
   tables side by side.
8. **Exact colors / theme rendering** of the instruction-field palette, written-cell teal, PC
   crosshair, and jump-arrow — worth a screenshot for the Spanish figures.
