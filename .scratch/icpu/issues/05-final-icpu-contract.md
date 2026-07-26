# 05 — Final ICPU contract cleanup

**What to build:** Close out the deepening by making `ICPU` a pure stepping-and-state contract with zero `any`. Rename the highlight accessor to say what it is, give the remaining accessors concrete types, and drop the control-advance methods that are now internal to `cycle()`. After this the interface reads as the single honest answer to "how does a CPU take one step".

**Blocked by:** 04 (`cycle()` returns a Cycle effect).

**Status:** ready-for-agent

- [ ] `currentInstruction()` is renamed to `highlightedInstruction()` and typed `DecodedInstruction`, at every call site (both CPUs' internals, the Simulator, the golden net); single-cycle returns the executing instruction and pipeline the just-fetched (IF/ID) instruction — meanings unchanged
- [ ] `getRegisterFile()`, `getDataMemory()`, `getProgram()`, `replaceDataMemory()`, `replaceRegisters()` are given concrete types (no `any`): register file, data memory, and `readonly DecodedInstruction[]` for the program
- [ ] `jumpToInstruction` and `nextInstruction` are removed from the public `ICPU` contract (control advance now lives inside `cycle()`)
- [ ] `ICPU` exposes only stepping and architectural state and contains no `any`
- [ ] The Spanish placeholder comment on the interface is replaced with a description matching `CONTEXT.md` → "CPU stepping seam (ICPU)"
- [ ] Golden net green; Cycle-effect and instruction unit suites green; project compiles; both simulators behave identically
