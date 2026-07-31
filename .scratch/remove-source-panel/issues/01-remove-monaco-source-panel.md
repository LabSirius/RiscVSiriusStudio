# 01 — Remove the Monaco source panel

**What to build:** The in-webview assembly source panel (`ProgramSection`, a
read-only Monaco editor shown in graphic mode) is gone, so the graphic view
reclaims the horizontal space it consumed. The authored source stays reachable
in the real VS Code editor, and jumping there still works: single-clicking the
address cell of a program-memory row reveals and highlights that source line in
the open file (the existing `clickInInstruction` → host `revealRange` path,
which does not pass through the panel). The onboarding tour no longer points at
the removed editor. The Monaco dependency is dropped now that nothing uses it.

**Blocked by:** None — can start immediately.

**Status:** done

- [ ] `ProgramSection` no longer renders in the webview in any mode; the graphic
      layout fills the freed space.
- [ ] Single-click on a program-memory address cell still reveals + highlights
      the corresponding line in the VS Code source editor (unchanged behaviour).
- [ ] The tutorial/tour runs without a step spotlighting the removed
      `#monaco-editor` element (that step is removed, not left dangling).
- [ ] `@monaco-editor/react` is removed from the client's dependencies; no import
      of it remains.
- [ ] Typecheck, lint, and the full test suite pass. Any now-inert source-panel
      state (e.g. `highlightedLine`, `clickAddressInMemoryTable`) may remain
      write-only for now — ticket 02 prunes it.
