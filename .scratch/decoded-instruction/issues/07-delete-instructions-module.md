# 07 — Delete instructions.ts

**What to build:** Retire the old stringly-typed predicate module. With every consumer migrated, `src/utilities/instructions.ts` has no importers; delete it. The compiler proves no call site remains, and the full test suite (unit fact-table + golden integration, both CPUs) is green. This is the contract step that closes the expand → migrate → contract sequence.

**Blocked by:** 03, 04, 05, 06 (all consumers migrated).

**Status:** done

- [x] `src/utilities/instructions.ts` is deleted
- [x] `tsc` compiles with zero references to the old module (no dangling imports)
- [x] Unit fact-table green; golden integration net green for both CPUs
- [x] `CONTEXT.md` `DecodedInstruction` entry still accurate (adjust only if the interface drifted during migration)
