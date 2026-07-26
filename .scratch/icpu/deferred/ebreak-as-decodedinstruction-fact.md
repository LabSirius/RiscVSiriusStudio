# Deferred — lift `ebreak`/halt detection into a `DecodedInstruction.isEbreak()` fact

**Surfaced by:** code-review (Standards axis) of `.scratch/icpu/issues/02`.

`SCCPU.cycle()`'s halt check (`isHalt`, `src/vcpu/singlecycle.ts`) reads raw IR
magic strings directly:

```ts
instruction.opcode === "1110011" &&
DecodedInstruction.from(instruction).funct3() === "000" &&
instruction.encoding.imm12 === "000000000001"
```

`ebreak`-ness is an **ISA fact** (SYSTEM opcode + funct3 0 + imm12 1), true
regardless of CPU — exactly what `CONTEXT.md` says `DecodedInstruction` is "the
single source of truth" for. It belongs as a `DecodedInstruction.isEbreak()`
predicate (`src/vcpu/instruction.ts`), matched against the `instruction.test.ts`
fact matrix, with `SCCPU` (and any future halt-aware CPU) calling it.

**Why deferred, not done in ticket 02:** ticket 02's declared file scope is the
single-cycle self-commit (`singlecycle.ts` / `Simulator.ts` / `golden.test.ts`).
This predicate was lifted **verbatim** from the old `Simulator.step()` `isEbreak`
literal — a behaviour-preserving move — so introducing a new `DecodedInstruction`
fact + test here would be scope creep into the ISA-fact domain. Small, safe,
independent follow-up.

**Status:** ready-for-agent
