# 04 — Migrate single-cycle CPU

**What to build:** Switch the single-cycle CPU over to `DecodedInstruction`. Register access, funct3, and the load/store path use the class: its inline `switch(funct3)` byte-width/extension decode is replaced by `memoryAccess()` + `extend()`, while the CPU keeps performing the actual `DataMemory.read`/`write`. Behaviour identical — golden net green. No shims.

**Blocked by:** 01 (DecodedInstruction class), 02 (golden net).

**Status:** done

- [x] `singlecycle.ts` no longer imports from `src/utilities/instructions.ts`; it consumes `DecodedInstruction`
- [x] Its inline `switch(funct3)` memory decode is gone, replaced by `memoryAccess()` + `extend()`
- [x] The CPU still performs `DataMemory.read`/`write`; only classification + extension moved behind the seam
- [x] Golden integration net green (single-cycle); unit fact-table green; `tsc` compiles
- [x] No shim/forwarding functions introduced
