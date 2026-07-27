# 05 — Final ICPU contract cleanup

**What to build:** Close out the deepening by making `ICPU` a pure stepping-and-state contract with zero `any`. Rename the highlight accessor to say what it is, give the remaining accessors concrete types, and drop the control-advance methods that are now internal to `cycle()`. After this the interface reads as the single honest answer to "how does a CPU take one step".

**Blocked by:** 04 (`cycle()` returns a Cycle effect).

**Status:** done

- [x] `currentInstruction()` is renamed to `highlightedInstruction()` and typed `DecodedInstruction`, at every call site (both CPUs' internals, the Simulator, the golden net); single-cycle returns the executing instruction and pipeline the just-fetched (IF/ID) instruction — meanings unchanged
- [x] `getRegisterFile()`, `getDataMemory()`, `getProgram()`, `replaceDataMemory()`, `replaceRegisters()` are given concrete types (no `any`): register file, data memory, and `readonly DecodedInstruction[]` for the program
- [x] `jumpToInstruction` and `nextInstruction` are removed from the public `ICPU` contract (control advance now lives inside `cycle()`)
- [x] `ICPU` exposes only stepping and architectural state and contains no `any`
- [x] The Spanish placeholder comment on the interface is replaced with a description matching `CONTEXT.md` → "CPU stepping seam (ICPU)"
- [x] Golden net green; Cycle-effect and instruction unit suites green; project compiles; both simulators behave identically

## Notes

- Single-cycle keeps a private `currentRawInstruction()` for internal raw-node access (the `executeX` methods read `.type`/`.inst`/`.encoding`); `highlightedInstruction()` wraps it in a `DecodedInstruction`. `jumpToInstruction` survives only as a **private** single-cycle helper — off the ICPU contract but still driving control advance inside `cycle()`.
- Added `DecodedInstruction.raw()` (returns the wrapped Raw IR node) so the Simulator can forward the raw node to the webview (which renders `opcode`/`encoding` directly) and map it to a source line — ADR-0001 wraps-does-not-replace holds.
- Added `RegistersFile.setRegisterData()` and reused `DataMemory.overwriteAvailableMemory()` in both CPUs' `replaceRegisters`/`replaceDataMemory`, deleting the `(x as any).field =` casts. This also aligns pipeline's `replaceDataMemory` with single-cycle (both now update `available_size`), so the two simulators behave identically.
- New `MemoryRow` type (`{ value0..3 }`) threads through `replaceDataMemory`/`replaceMemory`/`memoryChanged`.
