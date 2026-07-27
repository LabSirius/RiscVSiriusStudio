# Explore removing `highlightedInstruction()` from ICPU

**Type:** grilling
**Status:** done — **removed**; highlight derives from the Cycle effect. See
`docs/adr/0004-editor-highlight-from-cycle-effect.md`. Implemented on branch
`refactor/highlight-from-cycle-effect`.

Deferred question raised during the ICPU-deepening grill (see `CONTEXT.md` →
"CPU stepping seam", and `docs/adr/0002`, `docs/adr/0003`). Resolved in a
`grill-with-docs` session.

## Question

Should `highlightedInstruction()` stay on the ICPU contract, or be removed — with
the editor's line-highlight derived from the **Cycle effect** instead?

## Decision

**Remove it.** The editor highlight derives from a new
`CycleEffect.retiredInstruction`, and the pipeline-text highlight semantics flip
from *fetched* (IF/ID) to *retiring* (WB). Full rationale and rejected
alternatives (keep = R3; concrete-ref subclass = R2) in ADR-0004.

Key findings that drove it:

- `highlightedInstruction()` was the only ICPU member that is a **view query**,
  not architectural/stepping state. That — not any coupling cost — is the whole
  objection (Q1). It is a clean `DecodedInstruction`, no downcast, no `kind`-switch.
- Its **sole** load-bearing consumer is the pipeline **text** simulator wanting the
  IF/ID line; every other use is derivable from `getPC()`+`getProgram()` or the
  Cycle effect (Q2).
- The pipeline **graphic** simulator overrides `postStepUpdate` and drives **no**
  editor highlight, so the semantics choice bites only in pipeline-text mode.
- In text mode the highlight's only companion is the Cycle-effect register/memory
  notification (WB/MEM end). `fetched` semantics make the highlighted line disagree
  with that notification **every clock** — the bigger teaching sin than a
  fill-lag. Chose **retiring** (Q3).
- The `CycleEffect` had **no** reliable retiring-instruction field
  (`registerWrite?` is undefined for a store / branch / `nop`), so removal is not a
  deletion but a **move** onto the effect (Q4).
- The **golden net** snapshots only register file + data memory — the change
  regenerates no snapshots.

## Implementation spec (follow-up)

1. **Add** `retiredInstruction?: DecodedInstruction` to `CycleEffect`
   (`src/vcpu/cycle.ts`): single-cycle → the executing instruction; pipeline →
   the WB-stage instruction; `undefined` during fill/bubble.
2. **Delete** `highlightedInstruction()` from `interface.ts`, `singlecycle.ts`,
   `pipeline.ts`.
3. **Per-step highlight** (`TextSimulator.postStepUpdate`): line from
   `effect.retiredInstruction`; `undefined` → highlight nothing.
4. **Initial highlight** (`sendInitialData`, pre-first-cycle): one `simulatorType`
   branch — monocycle → `program[getPC()]` (preserve start-cursor); pipeline →
   nothing.
5. **Drop `StepResult.instruction`** → `StepResult = { effect }`;
   `currentMonocycletInst = effect.retiredInstruction?.raw()`; move end-detection to
   `finished()` + `retiredInstruction` presence (preserve the ebreak → stop path).
6. **Tests:** rewrite the `highlightedInstruction()` block in `cycle.test.ts` to
   assert `cycle().retiredInstruction` per clock (monocycle: executing; pipeline:
   WB / `undefined` on fill).
7. **CONTEXT.md:** on landing, drop the `highlightedInstruction()` glossary entry
   and fold `retiredInstruction` into the **Cycle effect** entry.

## What "done" looks like

A decision (keep / remove / change-the-highlight-semantics), with the rationale
recorded — and if "remove", an ADR so a future architecture review does not
re-suggest keeping it. **Met:** remove, ADR-0004. Any behaviour change must be
justified as an improvement, not a side effect — **met:** the retiring highlight
makes the highlighted line and the register/memory notification name the same
instruction each clock, on **both** CPU kinds.

Note — the change is **not** pipeline-only. Monocycle's per-step highlight also
moves, from the *next* line (old post-cycle `highlightedInstruction()`) to the
*just-executed* line (`retiredInstruction`). This surfaced in the `/code-review`
spec axis and was accepted as a deliberate, uniform improvement (same coherence
rationale); ADR-0004's Consequences records it. Educators see the change in both
the pipeline and monocycle views.
