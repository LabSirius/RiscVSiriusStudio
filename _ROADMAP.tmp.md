# Roadmap (temporary — safe to delete)

Scratch map of pending work, priority-sorted. Not a real spec; delete when no
longer useful. **This is the "after I clear the session" note — read it first in
a fresh session.** Each item below is self-contained: open a fresh session, paste
the prompt, work from the ticket file. Nothing needs a prior session's context.

Context hygiene: one item per session, clear between them. The `.scratch/` ticket
files carry everything an implementer needs.

---

## P1 — Bugs (user-facing breakage, fix first)

### 1. Pipeline CPU crashes on `lui`
`.scratch/pipeline-lui-crash/issues/01-pipeline-lui-alu-crash.md`
Pipeline feeds the absent `rs1` X-string into the ALU → `BigInt("0bXXXX")` throws.
Single-cycle special-cases `lui`; pipeline does not. A hard crash = highest priority.

```
/diagnosing-bugs work the bug in .scratch/pipeline-lui-crash/issues/01-pipeline-lui-alu-crash.md — reproduce it with a tight failing test first, then fix with a regression test.
```

### 2. Assembler rejects `lbu` / `lhu` — ✅ DONE (2026-07-29)
`.scratch/parser-lbu-lhu-missing/issues/01-parser-rejects-lbu-lhu.md`
Could-not-reproduce: generated parser was already in sync with `riscv.peg`
(`npm run parser` yields a zero diff), so `lbu`/`lhu` already assemble. Added
regression guard `src/utilities/lbu-lhu.test.ts` (commit `b228f731`). Golden net
already assembles them directly — no shim, 6 golden tests green. Nothing left.

### 3. Tables ignore theme toggle (app-wide)
`.scratch/table-theme-toggle-broken/issues/01-tables-ignore-theme-toggle.md`
All three Tabulator tables stay stuck at load-time theme on toggle. Pre-existing,
not caused by the SimulatorTable migration. Fix hypothesis in the ticket: move the
theme class onto a stable wrapper that is a true ancestor of the Tabulator
container in `SimulatorTable.tsx` — one change fixes all three tables.

```
/diagnosing-bugs work the bug in .scratch/table-theme-toggle-broken/issues/01-tables-ignore-theme-toggle.md — verify the diagnosis in the running webview first (is the theme class on an ancestor of .tabulator, does it flip on toggle), then apply the wrapper fix in SimulatorTable.tsx and confirm all three tables restyle.
```

---

## P2 — Tech debt

### 4. Clear `tsc --noEmit` strict errors
`.scratch/type-strictness/issues/01-strict-noemit-errors.md`
Well-scoped, no design needed. Unblocks a clean strict build.

```
/implement .scratch/type-strictness/issues/01-strict-noemit-errors.md
```

---

## P3 — Design grills (filed during the SimulatorTable work; open questions)

Each is a `grilling` ticket with decisions still to make. Resume the interview.

### 5. Register search — go declarative
`.scratch/register-search-declarative/issues/01-declarative-register-search.md`
Drop the `filterRegisters` handle escape added in the registers migration; move
the per-cell highlight into a rowFormatter. Touches value representation, so pairs
with candidate B (`Word`).

```
/grill-with-docs resume the grill in .scratch/register-search-declarative/issues/01-declarative-register-search.md — work the open decisions listed there.
```

### 6. Register reset semantics (+ remove unwanted import)
`.scratch/register-new-simulation-reset/issues/01-new-simulation-reset.md`
Should a new simulation clear watched / reset viewType? Is `isCreatedMemoryTable`
the right trigger? Also: remove the unwanted register-import feature (values come
from the program).

```
/grill-with-docs resume the grill in .scratch/register-new-simulation-reset/issues/01-new-simulation-reset.md — settle the reset trigger + watched/viewType persistence, and decide the import-feature removal.
```

### 7. Followable, toggleable jump arrow
`.scratch/jump-arrow-followable/issues/01-followable-jump-arrow.md`
Double-click to draw a scroll-anchored arrow that survives virtual scroll; toggle
off on second double-click. Grill decisions Q1-Q2 done; Q3-Q8 open.

```
/grill-with-docs resume the grill in .scratch/jump-arrow-followable/issues/01-followable-jump-arrow.md — Q1 (anchoring) and Q2 (click duties) are decided; work Q3-Q8.
```

---

## P4 — Feature, not started (spec only, no tickets yet)

### 8. Show input/output signal names on the initial datapath diagram
`.scratch/datapath-initial-signal-names/spec.md`
Spec exists, no tickets. Grill into a plan, then split.

```
/grill-with-docs sharpen the idea in .scratch/datapath-initial-signal-names/spec.md into a buildable plan, then /to-tickets.
```

---

## P5 — Docs (research done, chapters unwritten)

Manual chapters. Research notes ready; writing task, not code.
- `.scratch/manual/research/detail-panels.md`
- `.scratch/manual/research/graphic-cpu-view.md`
Target: `doc/manual/*.qmd`.

---

## Table search toolbar prototype — RESOLVED (2026-07-29)

A `/prototype` (UI branch) compared four toolbar shapes (A magnifier-expand,
B always-on field, C toolbar band, D band-with-collapse). **Variant D won.** The
magnifier was folded into an always-on **toolbar band** on top of every table
(`TableSearchBand`), with table controls moved into the band. The prototype
scaffolding (switcher, variant hook, Proto* components) was **deleted**, never
committed — the winner lives in the real code; no throwaway branch to keep.

Follow-on changes shipped in the same fold: program-memory auto-follow-PC toggle,
show-instruction-encoding toggle (encoding hidden by default), and an
instruction-text column. Memory `newPc > 0` gate dropped (see ADR-0007 update).

Open polish, deferred to a fresh session (user not happy yet):
- Instruction column / empty-space layout when the encoding column is hidden.
- **Get rid of the Monaco editor widget** next to program memory (big — grill it;
  ripples through line-click sync, jump arrows, autofocus-on-new-line, editing).

### Handoff workflow (carry this session's context into the fresh one)

The prototype detour is bridged by `/handoff` — it compacts the current conversation
into a markdown file so a fresh session starts with full context instead of re-deriving
it. `/handoff` **forks** (new session, context preserved); `/compact` continues in place.

Step 1 — in the session you want to leave, produce the handoff file:

——— PROMPT START ———
/handoff
——— PROMPT END ———

Step 2 — open a **new** session and resume from that file (paste the path `/handoff` prints):

——— PROMPT START ———
Read <path-to-handoff-file> for full context, then continue: <what to do next, e.g. the /prototype resume prompt above>.
——— PROMPT END ———
