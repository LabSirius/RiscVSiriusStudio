# 05 — Migrate pipeline CPU

**What to build:** Switch the pipeline CPU's MEM-stage load/store handling over to `DecodedInstruction`. The duplicated byte-width + sign/zero-extension logic (`sb`/`sh`/`sw`, `lb`/`lh`/`lw`/`lbu`/`lhu`) is replaced by `memoryAccess()` + `extend()`; the stage keeps doing the actual `DataMemory.read`/`write`. Behaviour identical — golden net green. No shims. (`memoryAccess()` derives from funct3, which equals the `DMCtrl` control signal the stage currently branches on.)

**Blocked by:** 01 (DecodedInstruction class), 02 (golden net).

**Status:** done

- [x] `pipeline.ts` no longer imports from `src/utilities/instructions.ts`; it consumes `DecodedInstruction`
- [x] The MEM-stage load/store `switch` on the memory control signal is replaced by `memoryAccess()` + `extend()`
- [x] The stage still performs `DataMemory.read`/`write`; only classification + extension moved behind the seam
- [x] Golden integration net green (pipeline); unit fact-table green; `tsc` compiles
- [x] No shim/forwarding functions introduced
