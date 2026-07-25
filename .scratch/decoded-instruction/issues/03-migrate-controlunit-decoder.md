# 03 — Migrate ControlUnit decoder

**What to build:** Switch the ControlUnit decoder over to `DecodedInstruction`. Its control-signal generation stops importing the stringly predicates (`isIArithmetic`, `isILoad`, `isIJump`, `isAUIPC`, `isILogical`, `getFunct3`, `getFunct7`, …) and asks the `DecodedInstruction` instead. Behaviour is identical — the golden net stays green. No forwarding shims.

**Blocked by:** 01 (DecodedInstruction class), 02 (golden net).

**Status:** done

- [x] `decoder.ts` no longer imports from `src/utilities/instructions.ts`; it consumes `DecodedInstruction`
- [x] Control signals produced are unchanged (golden integration net green for both CPUs)
- [x] Unit fact-table still green; project compiles (`tsc`)
- [x] No shim/forwarding functions introduced
