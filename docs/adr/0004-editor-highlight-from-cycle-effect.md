# Editor highlight derives from the Cycle effect's retiring instruction; `highlightedInstruction()` leaves ICPU

**Status: accepted and implemented.** Decision reached in the `grill-with-docs`
session over `.scratch/icpu/deferred/highlightedinstruction-removal.md`;
implemented on branch `refactor/highlight-from-cycle-effect`.
Supersedes the ICPU-deepening's interim choice to keep `highlightedInstruction()`
on the contract (see CONTEXT.md → "CPU stepping seam", ADR-0002, ADR-0003).

The seam between the shared **ICPU** contract (`src/vcpu/interface.ts`) and the
editor's per-clock line highlight is drawn on one axis:
**architectural/stepping state vs. a view query**.

- **ICPU carries only stepping and architectural state.** `cycle()`, `getPC()`,
  `finished()`, and the register-file / data-memory / program accessors. It carries
  **no** "what should the UI show" query.

- **The highlight is a view decision, driven by an observation.** The **Cycle
  effect** (ADR-0002) gains a top-level `retiredInstruction?: DecodedInstruction`
  — the instruction that *retired* this clock (single-cycle → the executing
  instruction; pipeline → the **WB**-stage instruction; **absent** during a
  pipeline fill or bubble). The view layer owns the policy "retiring → highlight
  this line." `ICPU.highlightedInstruction()` is removed.

## Why this line

`highlightedInstruction()` was the **only** ICPU member answering "what should the
UI show the user," while every other member answers "what is the architectural
state / what did the clock commit." Two different axes. It is not datapath-shaped,
so ADR-0003 did not condemn it — but it is a *view* query wearing an
*engine-contract* hat. That is the whole objection; there was no concrete coupling
cost (it was a clean `DecodedInstruction`, no downcast, no `kind`-switch).

Its sole load-bearing consumer is the **pipeline text simulator**, which needs the
IF/ID (fetched) line — a pipeline internal the view cannot reach through the shared
contract. Every other consumer is already derivable from `getPC()` + `getProgram()`
(single-cycle) or from the Cycle effect. So the real question was narrow: how does
the pipeline-text highlight get its instruction, and with what semantics.

**We move it onto the Cycle effect and flip the pipeline semantics from *fetched*
to *retiring*.** In text mode the highlight's only companion is the Cycle-effect
register/memory notifications, which come from the **WB/MEM** (retiring) end. With
`fetched` semantics the highlighted line and the "x5 ← …" notification named
*different* instructions **every clock** — actively misleading in a teaching tool.
With `retiring` semantics everything on screen this clock refers to **one**
instruction: one clock, one committed instruction, one line. This mirrors the seam
itself.

### Alternatives rejected

- **Keep `highlightedInstruction()` on ICPU (R3).** Rejected: leaves a view query
  on the engine contract; a future architecture review would re-flag it. The
  deferred ticket exists precisely to prevent that re-litigation.
- **A `PipelineTextSimulator` subclass holding a concrete `PipelineCPU`, reading
  IF/ID directly (R2, mirrors ADR-0003's graphic pattern).** This preserves
  `fetched` semantics. Rejected together with `fetched`: it keeps the
  highlight/notification incoherence that motivated the change, and adds a subclass
  to serve a semantics we decided against.

## Consequences

- **Behaviour change, UI-only, both CPU kinds.** The highlight now lights the
  *retiring* line for both, so it always agrees with the register/memory
  notification.
  - Pipeline-**text**: retiring (WB) line, not the fetched (IF/ID) line. Costs a
    ~4-clock highlight lag during fill and a blank cursor during a stall — both
    *honest*: nothing retired that clock.
  - Monocycle: **also changes.** The old highlight was computed *after* `cycle()`
    advanced the PC, so it led the cursor to the **next** line (`program[pc_after]`,
    debugger convention). The new highlight is the **just-executed** line
    (`retiredInstruction`), so the lit line now matches the effect the user is
    looking at (e.g. `addi` stays lit while its `x5 ← 42` shows). This is the same
    coherence gain as the pipeline change — a deliberate improvement, applied
    uniformly, not a pipeline-only tweak. The pre-first-cycle start-cursor
    (`program[getPC()]`, line 0) is preserved.
- **The golden integration net is unaffected.** It snapshots only register file and
  data memory (`src/vcpu/__snapshots__/golden.test.ts.snap`), never the highlight.
  No snapshot regenerates.
- `ICPU.highlightedInstruction()` is deleted from `interface.ts`, `singlecycle.ts`,
  `pipeline.ts`; its `cycle.test.ts` block is rewritten to assert
  `cycle().retiredInstruction` per clock.
- `CycleEffect` gains `retiredInstruction?: DecodedInstruction`. It is an
  *observation* ("this clock retired X"), consistent with the effect's existing
  charter of tagging each committed field with its producing instruction — a purer
  home than an ICPU view query. Optional: `undefined` = nothing retired.
- `StepResult` drops its separate pre-cycle `instruction` snapshot
  (`StepResult = { effect }`); `currentMonocycletInst` and end-detection source from
  `effect.retiredInstruction` + `finished()`. One observation, one field — the same
  "no second source of truth" posture as ADR-0002.
- The **initial** highlight (before the first `cycle()`, no effect yet) keeps the
  monocycle start-cursor via a single `simulatorType` branch in `sendInitialData`
  (monocycle → `program[getPC()]`; pipeline → nothing). This branch is in the view
  layer, on the initial-render path — not the engine seam or the per-step path that
  ADR-0002/0003 keep `kind`-free — so it re-leaks nothing into ICPU.
- Contrast ADR-0002 (commit vs. observation) and ADR-0003 (CPU-independent stepping
  vs. per-CPU render shape). This ADR draws the third line at the same boundary:
  *architectural state vs. a view query*. Together they make ICPU carry stepping and
  state, and nothing else.
