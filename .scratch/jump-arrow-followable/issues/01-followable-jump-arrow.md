# Followable, toggleable jump arrow

Status: needs-triage
Type: grilling

Future ticket. NOT part of the SimulatorTable migration (refactor/simulatortable-foundation).
The migration keeps the current single-click arrow behaviour byte-for-byte; this ticket
reworks it. Grilling was paused partway (see Open decisions).

## Problem

Clicking an address cell whose instruction jumps (e.g. a `loop:` branch/jump) draws an
arrow from the source cell to the target cell. Today `animateArrowBetweenCells`
(`utils/tables/handlersMemory.ts`) appends a one-shot SVG to `document.body` at fixed
page coordinates (`getBoundingClientRect`), auto-removed after 500ms. When the jump
target row is scrolled out of the table's viewport, the target rect lands above the
table, so the arrow shoots up into the CPU / datapath view above the table and looks
broken.

## Two hard facts that constrain any fix

1. **The arrow is page-anchored, not content-anchored.** It has no scroll listener, so
   when the table's inner body scrolls the cells move but the arrow does not.
2. **The table renders virtually** (`renderVertical: "virtual"` in `SimulatorTable.tsx`).
   Rows scrolled out of view are removed from the DOM, so an off-screen target cell has
   no element to measure or anchor to.

## The idea being grilled (user's)

Draw the arrow on **double-click** (not single). Draw from source cell to target cell
**without scrolling**. The user then scrolls the table and follows the arrow to find where
the tip lands. A later config option toggles "follow to target" (auto-scroll) on/off.
Double-clicking again on either the source or target cell removes the arrow.

## Decisions taken so far (grill)

- **Q1 Anchoring model = (A): re-anchor the arrow into the table's scroll container**,
  positioned by logical row math (row index x row height inside `.tabulator-tableholder`),
  NOT by cell `getBoundingClientRect`. Only model where "scroll along the arrow" is real
  and where it survives virtual row recycling. This is the core rework.
- **Q2 Click duties = keep it simple**: single-click keeps its existing behaviour
  (select the editor line + `sendMessage clickInInstruction`); double-click (`cellDblClick`)
  toggles the arrow on top. Accept that a native double-click still fires the single-click
  line-select first (harmless). No debounce/suppression.

## Open decisions (resume here)

- Q3 One active arrow at a time (new draw replaces old) vs multiple stacked arrows.
- Q4 Only jump rows are double-clickable to draw (non-jump rows do nothing) — confirm.
- Q5 Persistence scope: arrow must survive scroll + step `redraw()`; clear on new program
  load? on step? Define exactly what invalidates it.
- Q6 Editor-click path (`useEditorClickAnimation`, now folded into `ProgramMemory.tsx`
  via `handle.animateRow` / `handle.animateArrow`) also draws arrows on editor line click.
  Does it adopt the same followable/toggleable arrow, or stay a transient pulse?
- Q7 Config "follow to target": default now = no auto-scroll (draw, don't move). Confirm
  default; defer the settings plumbing/location.
- Q8 Visual: source and target share the address-column x, so the arrow is near-vertical
  in scroll space. Keep the existing curved SVG or simplify to a vertical line + arrowhead.

## Affected code

- `utils/tables/handlersMemory.ts` — `animateArrowBetweenCells` (the body-overlay draw).
- `components/panel/Sections/Tables/SimulatorTable.tsx` — `animateArrow` handle method.
- `components/panel/Sections/Tables/MemoryTable/ProgramMemory.tsx` — the `cellClick`
  (source of the draw) and the editor-click effect.
