# 01 — Relocate Export-memory into the Program-Memory toolbar

**What to build:** The program-memory hex/`.mif` export currently lives in the
Settings panel (`ExportMemory`, under "Export data → Memory"). Move it onto the
program-memory table itself: a toolbar button in `ProgramMemoryTable`'s
`TableSearchBand` `controls` slot, opening the same hex / `.mif` dropdown and
producing byte-identical output. The export already reads
`useMemoryTable().dataMemoryTable.program` — the exact rows the table shows — so
this is a lift of the existing logic, not a rewrite. The old Settings-panel copy
is left for ticket 03 to delete along with the rest of the panel.

**Blocked by:** None.

**Status:** done

- [ ] Program-memory toolbar gains an export control (a `Save`-style button with
      the hex / `.mif` dropdown) inside the `TableSearchBand` `controls` slot,
      alongside the existing encoding / follow-PC / locate / collapse controls.
- [ ] Clicking it exports the program memory as Verilog `.hex` or Quartus `.mif`
      with byte order, MIF header/depth, PC comments and asm annotations
      identical to today's `ExportMemory`.
- [ ] Export works whenever the table has rows (both `uploadMemory` and `step`).
- [ ] The `ExportMemory` logic no longer depends on the Settings panel; if a
      shared helper is extracted, it carries the exact current formatting.
- [ ] Typecheck, lint, and the full test suite pass.
