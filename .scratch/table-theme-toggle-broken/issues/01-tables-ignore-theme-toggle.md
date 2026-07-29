# Tables ignore theme toggle (stuck at load-time theme)

Status: needs-triage
Type: task

Pre-existing, app-wide bug found during the SimulatorTable registers migration (#3).
NOT caused by that migration: all three tables share the same theme wiring as before,
and the bug reproduces on the available-memory table too (migrated + verified back in #2).

## Symptom

Start in light theme, toggle to dark: all tables (available-memory, program, registers)
stay light. Start in dark, toggle to light: all tables stay dark. The rest of the app
(Tailwind `.dark` on the document root) switches correctly. Only the Tabulator tables are
stuck at whatever theme was active when they were built.

## Mechanism / hypothesis

Table dark styling is keyed on a custom class, `.theme-dark .tabulator { ... }`
(`components/panel/Sections/Tables/tabulator.css`), i.e. `theme-dark` must be an
*ancestor* of the `.tabulator` element. Today the `theme-light`/`theme-dark` class is put
directly on the div that Tabulator is built into (the `containerRef` div in
`SimulatorTable.tsx`, and the equivalent div in the old components). React does recompute
that className from `theme` on every render, but the toggle has no visible effect while
the initial build does — the signature of "theme read at build time, not reactive to the
class afterward" (Tabulator takes over the element; the live class change on it does not
restyle the built structure).

Likely fix: put the theme class on a **stable React-owned wrapper** that is a true
ancestor of the Tabulator container, e.g.

    <div className={theme === "light" ? "theme-light" : "theme-dark"}>
      <div ref={containerRef} />   {/* Tabulator builds here */}
    </div>

so toggling the wrapper class restyles the `.tabulator` descendant live. This would fix
all three tables at once in `SimulatorTable`. Note available-memory already calls
`handle.redraw()` on theme change and it still fails, so a redraw alone is NOT the fix —
the ancestor class must actually change relative to `.tabulator`.

## To verify the diagnosis first

In the running webview, inspect a table: confirm whether the `theme-dark`/`theme-light`
class is (a) present on the element that also carries the `tabulator` class, and (b)
whether it actually flips on toggle. That pins down whether it is a selector/nesting
problem (wrapper fix) or a className-not-updating problem.

## Affected code

- `components/panel/Sections/Tables/SimulatorTable.tsx` — where the theme class meets the
  Tabulator container.
- `components/panel/Sections/Tables/tabulator.css` — the `.theme-dark .tabulator` rules.
- The three table callers pass the theme class in via `className`.
