# Delete the stale shipped parser and un-shim the golden net

**Type:** follow-up
**Status:** done

Re-scoped 2026-07-26 after diagnosis (see "Diagnosis" below). Originally filed as
"regenerate the parser to close a mnemonic/label gap" — but the gap no longer
reproduces. The regenerated parser (`riscv.ts`) is already shipped and already
covers everything the old ticket listed. What remains is deleting the stale
artifact it superseded and removing the test-side workarounds that were built
around the (now-closed) gap.

## Diagnosis

Two generated parsers sit side by side in `src/utilities/`:

| Artifact    | Peggy  | Lines | State                         | Consumers                       |
| ----------- | ------ | ----- | ----------------------------- | ------------------------------- |
| `riscv.ts`  | 4.2.0  | 8601  | fresh, matches `riscv.peg`    | vitest **and** the esbuild bundle |
| `riscv.js`  | 4.0.2  | 6124  | stale, superseded             | none                            |

- **`riscvc.ts` imports `./riscv`** (extensionless), *not* `./riscv.js` as the
  original ticket claimed. esbuild has no `resolveExtensions` override, so its
  default order resolves `.ts` before `.js` — both the test runner and the
  production `out/` bundle load `riscv.ts`. Nothing in `src/` names `riscv.js`.
- **The "gap" does not reproduce.** Driving the live parser through
  `riscvc.compile()` accepts every instruction the old ticket said was rejected —
  `sltu`, `mul`, `div`, `rem`, `bltu`, `bgeu`, `lbu`, `lhu` — and every label it
  said was rejected — uppercase (`Foo:`), underscore (`be_q:`), and
  mnemonic-prefix (`subx:`). `riscv.peg` lists all the RV32M/branch/load forms;
  `riscv.ts` was regenerated from it (Peggy 4.2.0) and carries them.
- `riscv.js` (Peggy 4.0.2) is the older generation that still has the gap. It is
  dead weight: no extensionless import resolves to it.

## What "done" looks like

1. **Delete `src/utilities/riscv.js`.** Confirm nothing imports it by explicit
   `.js` path (grep is clean today) and that `npm run compile` / the esbuild
   bundle still builds and the extension still parses.
2. **Un-shim `src/vcpu/golden.test.ts`.** Drop the `encoding.funct3`/`funct7`
   (+ mnemonic) rewrite trick and the `g`-prefixed / lowercase / underscore-free
   label dodges. Assemble the real `sltu`/`mul`/`div`/`rem`/`bltu`/`bgeu`
   mnemonics and natural labels directly — real coverage instead of synthesized
   nodes. The net must stay green with both CPUs agreeing on every value.

## Watch out for

- **`type-strictness/01`** touches the same seam: `import { parse } from './riscv'`
  against `riscv.ts`, which emits `module.exports = {...}` (CommonJS) and trips a
  `TS2305`/strict-import complaint. That ticket owns the import/typing fix — do
  **not** regenerate the parser or change its module format here to chase it.
- Regenerating the parser is **not** in scope. `riscv.ts` is already current with
  `riscv.peg`; this ticket only removes the stale twin and its test workarounds.
