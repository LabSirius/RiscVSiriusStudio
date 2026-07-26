# Regenerate the shipped parser to close the mnemonic/label gap

**Type:** follow-up
**Status:** needs-triage

Surfaced while expanding the golden net (ticket `01-expand-golden-net`). Not
fixed there — the spec puts "regenerating the peggy parser" out of scope, so the
golden net works around the gap instead (see below).

## The gap

The shipped runtime parser (`src/utilities/riscv.js`, imported by
`src/utilities/riscvc.ts`) lags its own grammar source (`src/utilities/riscv.peg`
and the checked-in `riscv.ts`). It **rejects instructions the `.peg` lists**:

- R-type: `sltu`, `mul`, `div`, `rem` (and, untested, the other RV32M mulh/… and
  the `divu`/`remu` unsigned forms) — `add/sub/and/or/xor/sll/srl/sra/slt` parse.
- Branches: `bltu`, `bgeu` — `beq/bne/blt/bge` parse.
- Loads: `lbu`, `lhu` — already documented in `src/vcpu/golden.test.ts`.

It also rejects otherwise-valid **labels**:

- any label containing an uppercase letter (`beqTaken`) or underscore (`beq_nt`);
- any label whose text *starts with a mnemonic* — `beqt` reads as `beq`, `lbl`
  as `lb`, `sub` is itself a mnemonic. `l1`, `taken`, `foo`, `gbltut` are fine.

These are pre-existing limitations, not regressions from the ICPU work.

## How the golden net works around it (so the coverage is real)

`src/vcpu/golden.test.ts` assembles a parser-accepted placeholder and rewrites
the raw IR node's `encoding.funct3`/`encoding.funct7` (+ mnemonic) before
running — the same `funct3`-flip trick the net already used for `lbu`/`lhu`.
Both CPUs decode the ALU op and branch condition from `funct3`/`funct7`, so the
rewritten nodes exercise the genuine `sltu`/`mul`/`div`/`rem`/`bltu`/`bgeu` code
paths. Labels are kept lowercase, underscore-free, and `g`-prefixed to dodge the
mnemonic-prefix rule. The net is green and both CPUs agree on every value.

## What "done" looks like

Regenerate `riscv.js`/`riscv.ts` from `riscv.peg` (confirm the build step and
that the `.peg` truly covers these), then a follow-up could drop the synthesis
shims in `golden.test.ts` and use the mnemonics directly. Verify the regenerated
parser accepts the rejected instructions and labels, and that no downstream code
depended on the stale behaviour.
