# 02 — Golden-output integration net

**What to build:** A behaviour-drift net for the migration. A small RISC-V program, compiled through the existing assembler, is run headless through **both** CPU models (single-cycle and pipeline) to completion, and the final register file + data memory are snapshotted as a golden reference. The baseline is captured against the **current** (pre-migration) code, so any later behaviour change surfaces as a diff. The program exercises every load/store form (`lb`, `lbu`, `lh`, `lhu`, `lw`, `sb`, `sh`, `sw`) plus a branch and a jump — the exact code most prone to silent breakage during the migration.

**Blocked by:** None — can start immediately.

**Status:** done

- [x] A test constructs each CPU headless (no VS Code host) and drives a compiled program to completion
- [x] The program exercises `lb`, `lbu`, `lh`, `lhu`, `lw`, `sb`, `sh`, `sw`, at least one branch, and at least one jump
- [x] Final register file and data-memory state are asserted against a captured golden snapshot, for both CPUs
- [x] Baseline is captured against current behaviour and the test passes on the unmodified codebase
- [x] Test runs under the same runner as ticket 01 with one command
- [x] No production code is changed in this ticket

## Comments

Implemented as `src/vcpu/golden.test.ts` (+ `test/vscode-stub.ts` and a `vscode` alias
in `vitest.config.ts` so the CPU import path runs headless). Both CPUs snapshotted
independently — their store behaviour already diverges (monocycle commits a full word
per store, pipeline only the accessed bytes), so asserting the two agree would be wrong.

Two upstream limitations surfaced (both left untouched — production is out of scope here):
- The shipped generated parser (`riscv.ts`) rejects `lbu`/`lhu` even though the `.peg`
  source defines them. The two unsigned loads are synthesized by assembling `lb`/`lh`
  and flipping `funct3` (`synthesizeUnsignedLoads`); the CPUs classify width/signedness
  from `funct3`, so the real code paths are exercised (verified: `lb`→0xFFFFFFFF vs
  `lbu`→0xFF; `lh`→0xFFFFFFFF vs `lhu`→0x0000FFFF).
- The pipeline CPU crashes on `lui` (feeds the absent `rs1` X-string into the ALU →
  `BigInt("0bXXXX")`). Monocycle special-cases `lui`; the pipeline does not. Worth a
  separate bug ticket.
