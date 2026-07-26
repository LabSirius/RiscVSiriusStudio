# 02 — Single-cycle CPU self-commits stores, PC, and halt

**What to build:** Move the last externalized pieces of single-cycle architectural commit into `SCCPU.cycle()`, so the CPU owns advancing all of its own state (register writes and loads are already internal — only **stores**, **PC advance**, and **halt** remain outside). After this, no caller re-parses the CPU's render result to make simulation state advance. Observable behaviour is identical (ADR-0002).

**Blocked by:** 01 (expanded golden net).

**Status:** ready-for-agent

- [ ] `SCCPU.cycle()` commits its own store to data memory (the store-commit logic currently in `TextSimulator`/the golden monocycle driver moves inside)
- [ ] `SCCPU.cycle()` advances its own program counter for every instruction type (sequential fall-through and branch/jump), replacing the caller's `jumpToInstruction`/`nextInstruction` drive
- [ ] `ebreak`/halt is detected inside `cycle()` and reflected by `finished()`; the Simulator's inline `ebreak` check is removed
- [ ] `TextSimulator` monocycle path no longer commits stores or advances the PC (no double-commit); it still reads the result for register/memory notifications and the graphic view
- [ ] `cycle()` return type is unchanged in this ticket (still the single-cycle datapath result)
- [ ] The headless monocycle golden driver collapses to `while (!finished()) cycle()`, matching the pipeline driver
- [ ] Golden snapshots stay byte-identical; project compiles; single-cycle stepping works end-to-end in the extension
