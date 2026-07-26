# 02 — Single-cycle CPU self-commits stores, PC, and halt

**What to build:** Move the last externalized pieces of single-cycle architectural commit into `SCCPU.cycle()`, so the CPU owns advancing all of its own state (register writes and loads are already internal — only **stores**, **PC advance**, and **halt** remain outside). After this, no caller re-parses the CPU's render result to make simulation state advance. Observable behaviour is identical (ADR-0002).

**Blocked by:** 01 (expanded golden net).

**Status:** done

- [x] `SCCPU.cycle()` commits its own store to data memory (the store-commit logic currently in `TextSimulator`/the golden monocycle driver moves inside)
- [x] `SCCPU.cycle()` advances its own program counter for every instruction type (sequential fall-through and branch/jump), replacing the caller's `jumpToInstruction`/`nextInstruction` drive
- [x] `ebreak`/halt is detected inside `cycle()` and reflected by `finished()`; the Simulator's inline `ebreak` check is removed
- [x] `TextSimulator` monocycle path no longer commits stores or advances the PC (no double-commit); it still reads the result for register/memory notifications and the graphic view
- [x] `cycle()` return type is unchanged in this ticket (still the single-cycle datapath result)
- [x] The headless monocycle golden driver collapses to `while (!finished()) cycle()`, matching the pipeline driver
- [x] Golden snapshots stay byte-identical; project compiles; single-cycle stepping works end-to-end in the extension

## Outcome

Single-cycle self-commit landed behind the golden net (all 6 golden cases +
full 28-test suite green, snapshots byte-identical; `npm run compile` exit 0).

- **`src/vcpu/singlecycle.ts`** — `cycle()` now wraps the type dispatch: after the
  `execute*` method runs, it detects `ebreak` (`isHalt`) and advances the PC via
  `this.pc = parseInt(result.buMux.result, 2) / 4`. `buMux.result` already holds
  the next-PC byte address for every instruction type (sequential or taken
  branch/jump), so the one assignment is exactly equivalent to the old caller's
  `branchesOrJumps() ? jumpToInstruction(buMux) : nextInstruction()`.
  `executeSInstruction` commits its store through a new private `commitStore`
  (the full 32-bit little-endian word, quirk preserved verbatim from the golden
  driver / `writeResult`). New `halted` field; `finished()` returns
  `halted || pc >= length`.
- **`src/Simulator.ts`** — base `step()` captures `currentInstruction()` *before*
  `cycle()` (self-commit advances the PC, so afterwards it is the next
  instruction). `TextSimulator`'s monocycle branch no longer writes the register,
  commits the store, or advances the PC — it only notifies the UI; halt is
  handled by `if (this.cpu.finished()) stop()`, replacing the inline `isEbreak`
  check. `writeResult` → `notifyStore` (notify only; the write is `cycle()`'s).
  `executedPc` (captured pre-cycle) stamps `instruction.currentPc` for the
  graphic view.
- **`src/vcpu/golden.test.ts`** — `runMonocycle` collapses to
  `while (!finished()) cycle()`, identical to `runPipeline`; the external
  `commitStore` helper and the now-unused `SCCPUResult` import are gone.

The register-write re-commit that `TextSimulator` also did (same value cycle()
already wrote) was dropped as a genuine double-commit; the golden net — which
drives `cycle()` alone — proves cycle()'s internal register commit is correct.
`cycle()` still returns `SCCPUResult`; `jumpToInstruction`/`nextInstruction`
remain on the class/interface (now unused by callers) for ticket 05 to remove
with the rest of the contract.
