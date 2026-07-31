# 03 — Remove the Settings panel and its orphaned wiring

**What to build:** With export-memory (ticket 01) and the watch toggle
(ticket 02) rehomed onto their tables, delete `SettingsSection` and everything
that only fed it. Drop the functionalities not being kept, remove the Sidebar's
Settings entry, and fix the tutorial / message copy that pointed at the panel.
The `section` state already defaults to `"convert"`, so no default change is
needed.

**Blocked by:** 01, 02.

**Status:** done

**Delete (component tree):**

- [ ] `SettingsSection`, `ManualConfig`, `StepConfig`, `MemorySizeInput`,
      `ImportRegister`, `ImportMemory`, `ExportRegisters`,
      `SwitchSeeRegistersChanged`, `SwitchAutoFocusOnNewLine`, and the now-moved
      `ExportMemory` original are removed; no import of them remains.
- [ ] `MainSection.tsx` no longer renders `SettingsSection`; both
      `section === "settings"` branches (uploadMemory and step) are gone.
- [ ] `SideBar.tsx` no longer offers the `settings` menu item.

**Drop the dropped functionalities' wiring:**

- [ ] Import: `setImportRegister` / `setImportMemory` and their context fields
      are removed (no remaining producer or consumer).
- [ ] `SwitchAutoFocusOnNewLine`: the inert `switchAutoFocusOnNewLine` /
      `setSwitchAutoFocusOnNewLine` field is deleted from `CustomOptionSimulate`.
- [ ] MemorySizeInput UI is gone; `sizeMemory` / `setSizeMemory` stay in
      `MemoryTableContext` (host sets it on upload via `useMessageListener`;
      `AvailableMemory` still resizes + sets SP off it). No in-webview control
      sets it for now — the future dialog is `sim-start-config-dialog`.

**Tutorial / message copy:**

- [ ] `useTutorial.ts`: the settings tour step (spotlighting `#settings-section`)
      and the `section === "help" → setSection("settings")` auto-switch are
      removed; the tour runs with no step pointing at the removed panel.
- [ ] `useTutorial.ts`: the watch-list note "(You can change this in settings.)"
      is reworded to point at the registers-toolbar toggle from ticket 02.
- [ ] `useMessageListener.ts`: the "Before executing the first instruction, you
      can change the simulation settings." prompt and its `setSection("settings")`
      are removed.

**Result:**

- [ ] The lower view shows Convert or Help in the section slot; the graphic view
      reclaims the space the Settings column consumed.
- [ ] Typecheck, lint, and the full test suite pass; no dead settings-panel
      state or dangling `"settings"` section reference remains.
