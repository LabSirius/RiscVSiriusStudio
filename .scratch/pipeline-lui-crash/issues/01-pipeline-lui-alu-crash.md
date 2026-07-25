# 01 — Pipeline CPU crashes on `lui` (X-string reaches the ALU)

**Status:** needs-triage

**Type:** bug

## Summary

The pipeline CPU (`src/vcpu/pipeline/pipeline.ts`) throws when it executes a
`lui` instruction:

```
SyntaxError: Cannot convert 0bXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX to a BigInt
```

The single-cycle CPU runs `lui` correctly; only the pipeline is affected.

## How it surfaced

Found while building the golden-output integration net (ticket
`decoded-instruction/02`). A candidate test program used `lui x8, 8` to
construct a value with bit 15 set. The single-cycle CPU ran it; the pipeline
crashed. The golden program was rewritten to avoid `lui`, so this bug is not
covered by any existing test.

## Reproduction

Drive the pipeline CPU headless (as the golden test does) over any program
containing a `lui`. Minimal case:

```asm
lui x8, 8
```

Runs clean on `SCCPU`, throws on `PipelineCPU`.

## Root cause

`lui` is a U-type instruction and has **no `rs1`**. In `executeID`, an absent
`rs1` yields `RUrs1 = "X".padStart(32, "X")` (`pipeline.ts` ~line 362). In
`executeEX`, operand A is only overridden by the PC when `ALUASrc` is set —
which is true for `auipc` but **not** for `lui` (see `ControlUnit.generate`,
U-type case: `alua_src` is left false unless `isAUIPC`). So for `lui`:

```ts
const finalOperandA = ALUASrc ? intToBinary(PC) : operandA; // operandA = "XXXX...X"
const ALURes = this.alu.execute(finalOperandA, finalOperandB, ALUOp); // ALUOp = add
```

`ProcessorALU.execute` does `BigInt("0b" + A)`, and `BigInt("0bXXXX...")`
throws.

The single-cycle CPU avoids this because `executeUInstruction` explicitly sets
`aluInputA = "0".padStart(32, "0")` for the non-`auipc` case
(`singlecycle.ts` ~line 348) instead of using the register value.

## Suggested fix direction

Make the pipeline's `lui` path feed a defined operand A (zero, matching the
single-cycle CPU) rather than the absent-register X-string — e.g. treat U-type
`lui` the way the single-cycle CPU does, or gate operand A on U-type in
`executeEX`. Whichever seam is cleanest; confirm against the single-cycle CPU's
`lui` result so both CPUs agree.

## Regression test

The golden-output net (`src/vcpu/golden.test.ts`) is the natural home: add a
`lui`-bearing program (or a dedicated case) and snapshot both CPUs, so the fix
is pinned and the two CPUs are shown to agree on `lui`.

## Out of scope

Not part of the DecodedInstruction migration (`.scratch/decoded-instruction/`).
That effort is behaviour-preserving and must not change CPU behaviour; fixing
this crash is a behaviour change and belongs to its own ticket.
