# Datapath: show input/output signal names on the initial diagram

**Status:** ready-for-agent

**Type:** feature (UI / graphic simulator)

## Summary

When the webview initializes, all datapath components render, but the models
show **no input/output signal names**. The names appear only once an
instruction is executed. We want the signal names present in the **initial**
diagram (before any step), with the numeric values still deferred until
execution.

## Current behavior

- Each component couples its signal **name** (the `label`) with its **value**
  in a single `LabelValueWithHover` (`client/simulator/src/components/graphic/
  elements/LabelValueWithHover.tsx` → `LabelValue.tsx`).
- These are gated behind per-component execution flags — `isActive`,
  `showComponent`, `showWriteData`/`showReadData`, `operation !== "uploadMemory"`
  — so nothing renders until the sim produces data.
- Exception: `PC` already shows its `PC` / `NextPc` names on init (with `--`
  values); it's gated only on upload, not on execution. That is the target
  look for the rest.

## Components missing initial names

`client/simulator/src/components/graphic/elements/`:

- `MEM/DataMemory/LabelValueContainer.tsx` (Address, DataWr, DataRd + write/ctrl signals)
- `ID/RegistersUnit/LabelValueContainer.tsx` + `LabelSlashContainer.tsx`
- `ID/ControlUnit/LabelValueContainer.tsx` + `LabelSlashContainer.tsx`
- `ID/ImmGenerator/LabelValueContainer.tsx`
- `IE/ALU/LabelValueContainer.tsx`
- `IE/BranchUnit/LabelValueContainer.tsx`
- `IE/MuxA.tsx`, `IE/MuxB.tsx`, `IF/MuxD.tsx`, `WB/MuxC.tsx`
- `IF/InstructionMemory/LabelValueContainer.tsx`

## Approach (decided: A — relax the gates)

For each component, split "render the **label** always" from "render the
**value** only after execution." Reuse the existing `positionClassName` /
placement; show `--` (or blank) for values pre-execution, matching how `PC`
already behaves. Preferred over a separate static-names overlay (path B) so we
don't duplicate label strings and positions.

Notes:
- Muxes render a single unnamed signal value (`label=""`); decide whether they
  need a visible name or stay value-only. Confirm with a maintainer.
- Some labels are computed (ALU op, control-signal description). Only the
  static **port names** should appear on init; computed descriptions stay
  deferred.

## Acceptance

- On a fresh webview (post-upload, pre-step), every model shows its input/output
  signal names, matching PC's initial look.
- Values still appear only after an instruction executes; no regression to the
  executed-state rendering.
- Verified visually in both monocycle and pipeline graphic simulators.

## Scope / effort

~10 component files, mechanical but position-sensitive; each needs a visual
check. Estimated a couple of hours. Postponed 2026-07-28.
