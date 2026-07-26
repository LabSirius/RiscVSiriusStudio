# 01 — Expand the golden net (prefactor)

**What to build:** Widen the golden integration net (`src/vcpu/golden.test.ts`) so it pins the behaviour the ICPU deepening will disturb — control flow and ALU results — before any migration touches it. Add golden programs, run headless through both CPUs to completion, and snapshot register file + data memory against **current** behaviour (quirks included, exactly as the existing net does). This is the safety guard every later ticket relies on.

**Blocked by:** None — can start immediately.

**Status:** done

- [x] New golden program(s) exercise every branch condition (`beq`, `bne`, `blt`, `bge`, `bltu`, `bgeu`) in both taken and not-taken outcomes
- [x] Coverage includes `jalr` (register-indirect jump) and a backward-branch loop
- [x] New golden program(s) exercise R-type arithmetic/logical/shift (`add`, `sub`, `and`, `or`, `xor`, `sll`, `srl`, `sra`), `slt`/`sltu`, and RV32M `mul`/`div`/`rem`
- [x] No `lui`/`auipc` appears in any program run through the pipeline CPU (known pipeline `lui` crash is out of scope); `lbu`/`lhu` continue to be synthesized via the `funct3` flip as the existing net does
- [x] Snapshots captured for both CPUs; the full net (existing + new) is green on the current, pre-migration code
- [x] Any pre-existing bug the new programs surface is pinned by the golden (not fixed here) and noted as a separate follow-up

## Outcome

Two new programs added to `src/vcpu/golden.test.ts`, each snapshotted through both
CPUs (net is now 6 cases, all green; full suite 28 tests green):

- **control-flow net** — all six branch conditions taken + not-taken, a `jalr`
  subroutine return, a backward-branch countdown loop. Both CPUs agree on every
  register.
- **arithmetic net** — `add/sub/and/or/xor`, `sll/srl/sra`, `slt`/`sltu`, and
  RV32M `mul/div/rem` including the spec-defined divide-/remainder-by-zero
  results. Both CPUs agree on every register.

No CPU divergence surfaced — the pre-migration behaviour is clean here.

The shipped parser's mnemonic/label gap (broader than the previously-documented
`lbu`/`lhu`: it also rejects `sltu`/`mul`/`div`/`rem`/`bltu`/`bgeu` and labels
that start with a mnemonic or contain uppercase/underscore) is worked around with
the same `funct3`/`funct7`-flip synthesis the net already used for `lbu`/`lhu`,
and is recorded as a follow-up in `.scratch/icpu/deferred/parser-mnemonic-gap.md`.
