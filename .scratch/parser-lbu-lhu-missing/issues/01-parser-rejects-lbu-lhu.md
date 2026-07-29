# 01 — Assembler rejects `lbu` / `lhu`

**Status:** resolved — could-not-reproduce (parser already in sync)

## Resolution (2026-07-29)

Bug does **not** reproduce against the committed tree. The generated
`src/utilities/riscv.ts` already wires `LoadUInstName` (`peg$parseLoadUInstName`)
into the `LInstruction` rule, so `lbu`/`lhu` assemble. Evidence:

- `lbu x13, 0(x0)` -> `success: true`, funct3 `100`, opcode `0000011`.
- `lhu x15, 8(x0)` -> `success: true`, funct3 `101`, opcode `0000011`.
- `npm run parser` (regenerate from `riscv.peg`) produces a **zero diff** on
  `riscv.ts` — generated parser and grammar are already in sync.

The parser must have been regenerated in a commit after this issue was filed
(the `LoadUInstName` wiring is present as of `6812a8fa`). No production change
needed. Added regression guard `src/utilities/lbu-lhu.test.ts` covering all base
loads plus the funct3/opcode of `lbu`/`lhu`. The `synthesizeUnsignedLoads`
workaround in the golden net can now be replaced with real assembled nodes.

**Type:** bug

## Summary

The shipped assembler cannot parse the unsigned load instructions `lbu` and
`lhu`, even though the RISC-V base ISA defines them and the peggy grammar
source (`src/utilities/riscv.peg`) lists them. Every other base load/store
form (`lb`, `lh`, `lw`, `sb`, `sh`, `sw`) parses fine.

```
lbu x13, 0(x0)   ->  SyntaxError: Expecting a valid instruction, Got:"lbu x13, 0(x0)"
lhu x15, 8(x0)   ->  SyntaxError: Expecting a valid instruction ...
```

## How it surfaced

Found while building the golden-output integration net (ticket
`decoded-instruction/02`), whose program must exercise every load/store form.
`lbu`/`lhu` could not be assembled, so the test synthesizes those two nodes by
assembling `lb`/`lh` and flipping `funct3`. That workaround is fine for the
net, but the underlying assembler gap remains.

## Reproduction

```ts
import { compile } from "./src/utilities/riscvc";
compile("lbu x13, 0(x0)\n", "x.asm"); // success: false, SyntaxError
compile("lb  x13, 0(x0)\n", "x.asm"); // success: true
```

## Root cause

`compile()` uses the **generated** parser `src/utilities/riscv.ts`, not the
`.peg` source directly. The grammar source defines the unsigned loads:

```peg
LoadUInstName "load unsigned type instruction name"
  = lbuToken
  / lhuToken
```

and wires them into the `LInstruction` rule as a second alternative. But the
committed `riscv.ts` was generated from an **older** grammar (or a state where
that alternative was commented out — note the `// / lbuToken` lines still
present in `LoadInstName`): its `Instruction` rule reaches none of the
`LoadUInstName` alternatives, so it reports "Expecting a valid instruction".

The generated file and the `.peg` are out of sync.

## Suggested fix direction

- Confirm the `.peg` `LInstruction` / `LoadUInstName` rules are correct for
  `lbu`/`lhu` (register + `offset(reg)` form).
- Regenerate the parser: `npm run parser` (or `npm run parservs` for the ESM
  variant — check which output `compile` imports; it currently imports from
  `./riscv`).
- Verify `lbu`/`lhu` now assemble and produce nodes with `funct3` `100` / `101`
  and opcode `0000011`.
- Add an assembler-level test covering all base loads including `lbu`/`lhu`.

Note: regenerating `riscv.ts` is a production change and was deliberately out
of scope for ticket `decoded-instruction/02` (no production changes in that
ticket), which is why the golden test worked around it instead.

## Follow-up

Once the assembler emits real `lbu`/`lhu` nodes, the golden net's
`synthesizeUnsignedLoads` workaround (`src/vcpu/golden.test.ts`) can be
replaced with assembled instructions.

## Out of scope

Not part of the DecodedInstruction migration (`.scratch/decoded-instruction/`).
