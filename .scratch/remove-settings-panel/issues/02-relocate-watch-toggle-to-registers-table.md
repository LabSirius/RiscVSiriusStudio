# 02 — Relocate the watch toggle into the Registers toolbar

**What to build:** The "Automatically add changing registers to the watch list"
switch (`SwitchSeeRegistersChanged`, toggling `checkFixedRegisters` in
`CustomOptionSimulate`) moves from the Settings panel onto the registers table.
Render it as a `ToolbarToggle` in `RegisterTable`'s `TableSearchBand` `controls`
slot (next to the collapse arrow). It reads and writes the same
`checkFixedRegisters` context, so `RegisterTable`'s existing consumer (auto-mark
changed registers `watched`) is untouched — only the control's location changes.
The old Settings-panel switch is left for ticket 03 to delete.

**Blocked by:** None.

**Status:** done

- [ ] Registers toolbar gains a `ToolbarToggle` bound to
      `checkFixedRegisters` / `setCheckFixedRegisters`, with an on/off title
      conveying "auto-add changing registers to the watch list".
- [ ] Toggling it still drives `RegisterTable`'s auto-watch behaviour exactly as
      before (no change to the rowFormatter / effect that reads
      `checkFixedRegisters`).
- [ ] The toggle is visible in both `uploadMemory` and `step` (wherever the
      registers table shows), matching today's availability.
- [ ] Typecheck, lint, and the full test suite pass.
