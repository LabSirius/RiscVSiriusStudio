# Remove the Settings panel (lower-view rightmost section)

## Goal

Delete `SettingsSection` — the rightmost section in the lower web view (the
"Memory size / Import / Export / toggles" panel driven by the Sidebar's Settings
icon). The Sidebar keeps **Convert** and **Help**; only Settings goes.

Controls worth keeping move onto the **table they govern** (export → program
memory table; watch toggle → registers table). The rest are dropped — most are
redundant or already inert.

## Design principle (emerging)

Simulator controls live on the table they govern, not in a shared settings
panel. This session moves two controls onto their tables and deletes the panel.

## Scope

Scope **A**: remove `SettingsSection` only. Convert + Help sections and the
Sidebar itself stay. The `section` state already defaults to `"convert"`.

## Per-functionality verdicts

| Functionality | Verdict | Destination |
|---|---|---|
| Import register + Import memory | Drop | delete files + `setImportRegister` / `setImportMemory` wiring |
| Export registers | Drop | — |
| Export memory (hex/mif) | Relocate | Program-Memory toolbar, same impl on `dataMemoryTable.program` |
| MemorySizeInput | Drop UI | keep `sizeMemory` context (host-fed on upload); future dialog — see `sim-start-config-dialog` |
| SwitchSeeRegistersChanged (watch) | Relocate | Registers toolbar as a `ToolbarToggle` |
| SwitchAutoFocusOnNewLine | Drop | inert — no reader; delete dead `CustomOptionSimulate` field |
| Hint "Press ⟳ to execute the first instruction" | Drop | tutorial already covers starting |

## Consequential cleanup

- `SideBar.tsx` — remove the `settings` menu item.
- `MainSection.tsx` — remove both `section === "settings"` branches.
- `useTutorial.ts` — remove the settings tour step (`#settings-section`) and the
  `setSection("settings")` auto-switch; redirect the watch-note copy
  ("You can change this in settings") → the registers-toolbar toggle.
- `useMessageListener.ts` — drop the "change the simulation settings" prompt and
  its `setSection("settings")`.

## Ordering

Relocate first (tickets 01, 02), then delete the panel + wiring (ticket 03).
Moving before deleting keeps the export / watch code from being lost.

## Out of scope

- The start-of-simulation configuration dialog (memory size + SP + defaults):
  tracked separately in `.scratch/sim-start-config-dialog/`.
- The Convert and Help sections, and the Sidebar mechanism itself.
