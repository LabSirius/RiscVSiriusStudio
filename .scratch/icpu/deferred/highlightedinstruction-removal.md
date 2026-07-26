# Explore removing `highlightedInstruction()` from ICPU

**Type:** grilling
**Status:** needs-triage

Deferred question raised during the ICPU-deepening grill (see `CONTEXT.md` →
"CPU stepping seam", and `docs/adr/0002`, `docs/adr/0003`).

## Question

Should `highlightedInstruction()` stay on the ICPU contract, or be removed — with
the editor's line-highlight derived from the **Cycle effect** instead?

## Context

`highlightedInstruction()` (renamed from `currentInstruction()`) exists only to
tell the editor which source line to highlight each clock. Its meaning already
differs per CPU:

- single-cycle → the *executing* instruction (`_program[pc]`)
- pipeline → the *just-fetched* IF/ID instruction (`if_id_register.instruction`)

The ICPU-deepening work keeps it (retyped `any → DecodedInstruction`) because
removing it **changes UI behaviour**: deriving the highlight from the Cycle
effect's producing instruction would, in the pipeline, highlight the *retiring*
(WB) instruction rather than the *fetched* one. That is a deliberate UX decision,
not a mechanical refactor, so it is out of scope for the behaviour-preserving
deepening.

## What "done" looks like

A decision (keep / remove / change-the-highlight-semantics), with the rationale
recorded — and if "remove", an ADR so a future architecture review does not
re-suggest keeping it. Any behaviour change must be visible to an educator using
the pipeline view and justified as an improvement, not a side effect.
