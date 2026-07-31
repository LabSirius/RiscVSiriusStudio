# 02 — Prune orphaned source-panel wiring

**What to build:** After the source panel is gone (ticket 01), the state that
only fed it is dead — written by producers, read by no one. Remove it so no
reader stumbles on inert fields. The `highlightedLine` signal and the entire
`ShellContext`/`ShellProvider`/`useShell` that held it (its sole field) are
deleted, along with the host-message writes that set it. The
`clickAddressInMemoryTable` field and the program-memory setter call that fed
it are removed. Nothing user-visible changes — both signals were already inert
after ticket 01.

**Blocked by:** 01 — Remove the Monaco source panel.

**Status:** done

- [ ] `ShellContext`, `ShellProvider`, and `useShell` are deleted; the provider
      is removed from the providers tree.
- [ ] The `setHighlightedLine` writes in the message listener (upload + step
      paths) are removed; the host may still send the line field, the webview
      simply stops consuming it.
- [ ] `clickAddressInMemoryTable` (and its setter) is removed from the lines
      context, and the program-memory address cellClick no longer calls it; the
      `clickInInstruction` message and jump-arrow animation are untouched.
- [ ] `clickInEditorLine` and `textProgram` are left intact (still consumed by
      program-memory / GeminiChat respectively).
- [ ] An ADR note records the `ShellContext` removal against the ADR-0005 area.
- [ ] Typecheck, lint, and the full test suite pass; no dead source-panel state
      remains.
