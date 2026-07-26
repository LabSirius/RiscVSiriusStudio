# 06 — Migrate Simulator layer

**What to build:** Switch the Simulator orchestration layer over to `DecodedInstruction`. Byte counts come from `memoryAccess().bytes` instead of the layer's own `bytesToReadOrWrite` `switch(funct3)`; the predicate imports (`branchesOrJumps`, `readsDM`, `writesDM`, `writesRU`, `getFunct3`) are replaced by class methods. CPU-decoding logic stops leaking into orchestration. Behaviour identical — golden net green. No shims.

**Blocked by:** 01 (DecodedInstruction class), 02 (golden net).

**Status:** done

- [x] `Simulator.ts` no longer imports from `src/utilities/instructions.ts`; it consumes `DecodedInstruction`
- [x] `bytesToReadOrWrite` is removed; byte counts come from `memoryAccess()`
- [x] Golden integration net green (both CPUs); unit fact-table green; `tsc` compiles
- [x] No shim/forwarding functions introduced
