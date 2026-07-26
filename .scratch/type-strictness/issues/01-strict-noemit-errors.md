# 01 — Clear the hand-written `tsc --noEmit` strict errors

**What to build:** Fix the type errors that `tsc --noEmit -p .` reports in
**hand-written** source, so a strict typecheck of the extension host is clean.
The build ships via `esbuild` (transpile-only, `npm run compile` is green), so
these do not gate the build today — but they hide real defects (a possibly-undefined
deref, a missing symbol) behind noise and block ever adding `tsc` to CI.

**Blocked by:** None.

**Status:** ready-for-agent

**Provenance:** surfaced incidentally while implementing `.scratch/icpu/issues/02`
(single-cycle self-commit). Unrelated to that ticket and pre-existing on `main` —
parked here rather than fixed inline to keep that diff behaviour-preserving. The
ICPU touched files (`src/Simulator.ts`, `src/vcpu/singlecycle.ts`,
`src/vcpu/golden.test.ts`) are already clean under `tsc`.

## Scope

`tsc --noEmit -p .` reports **367** errors. **355** of them are in
`src/utilities/riscv.ts`, the peggy-**generated** parser — **out of scope**
(regenerating / re-typing the parser is explicitly excluded, see
`.scratch/icpu/spec.md` → Out of Scope, and `.scratch/icpu/deferred/parser-mnemonic-gap.md`).
This ticket is the remaining **11 hand-written** errors plus the 1 generated-seam
import error, listed below.

- [ ] `src/utilities/cli.ts` — 5× `TS4111` index-signature access (`args.input` → `args['input']`, `args.outBinary` → `args['outBinary']`) and 1× `TS18048` `result.ir` possibly `undefined` (guard before deref — this is a real latent crash)
- [ ] `src/utilities/conversions.ts` — 2× `TS4111` (`.x`/`.y` → bracket access), 1× `TS2304` `Cannot find name 'RegisterView'` (missing import or type — real, resolve the symbol)
- [ ] `src/lineTracker.ts` — 1× `TS2339` `Property '_editorselection' does not exist on type 'LineTracker'` (likely a typo for an existing field — real bug)
- [ ] `src/support/configurationManager.ts` — 1× `TS4111` (`.editor` → bracket access)
- [ ] `src/utilities/riscvc.ts` — 1× `TS2305` `Module './riscv' has no exported member 'parse'` (generated-parser seam: `riscv.ts` typings vs the `riscv.js` runtime that actually exports `parse`; fix the import/typings without regenerating the parser)
- [ ] Generated `src/utilities/riscv.ts` (355 errors) is **not** touched here; if it must go quiet, do it via a targeted `tsconfig`/`// @ts-nocheck` exclusion in a separate follow-up, not by editing generated output
- [ ] After the fixes, `tsc --noEmit -p .` reports only the excluded generated-parser errors (or zero, if the parser is excluded)

## Full error list (captured at parking time)

```
src/lineTracker.ts(13,27): error TS2339: Property '_editorselection' does not exist on type 'LineTracker'.
src/support/configurationManager.ts(9,66): error TS4111: Property 'editor' comes from an index signature, so it must be accessed with ['editor'].
src/utilities/cli.ts(18,14): error TS4111: Property 'input' comes from an index signature, so it must be accessed with ['input'].
src/utilities/cli.ts(22,36): error TS4111: Property 'input' comes from an index signature, so it must be accessed with ['input'].
src/utilities/cli.ts(23,43): error TS4111: Property 'input' comes from an index signature, so it must be accessed with ['input'].
src/utilities/cli.ts(25,46): error TS4111: Property 'input' comes from an index signature, so it must be accessed with ['input'].
src/utilities/cli.ts(27,13): error TS4111: Property 'outBinary' comes from an index signature, so it must be accessed with ['outBinary'].
src/utilities/cli.ts(29,24): error TS18048: 'result.ir' is possibly 'undefined'.
src/utilities/conversions.ts(159,24): error TS4111: Property 'x' comes from an index signature, so it must be accessed with ['x'].
src/utilities/conversions.ts(160,24): error TS4111: Property 'y' comes from an index signature, so it must be accessed with ['y'].
src/utilities/conversions.ts(172,48): error TS2304: Cannot find name 'RegisterView'.
src/utilities/riscvc.ts(1,10): error TS2305: Module '"./riscv"' has no exported member 'parse'.
```

`TS4111` (index-signature access) is mechanical. `TS18048` (`result.ir` deref),
`TS2304` (`RegisterView`), and `TS2339` (`_editorselection`) are the ones worth a
careful look — each points at a latent runtime defect, not just a strictness nit.
