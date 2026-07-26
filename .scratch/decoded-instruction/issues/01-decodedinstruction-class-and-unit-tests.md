# 01 — DecodedInstruction class + Vitest fact-table

**What to build:** The deep `DecodedInstruction` module — the single home for instruction facts. Construct it from a raw IR node via `DecodedInstruction.from(rawNode)`; it wraps the node and reads fields lazily (raw node, assembler, parser, and `InternalRepresentation` untouched). Expose a narrow dotted interface: the instruction-fact queries that replace the stringly predicates (register usage + name getters, funct3/funct7, opcode→type, `readsMemory`, `writesRegister`, `writesMemory`, `branchesOrJumps`, `storesNextPC`, `usesALU`, `usesImmediate`, and the specific-form predicates), a single `memoryAccess(): { bytes: 1|2|4, signed: boolean } | null`, and a pure `extend(bits)` sign/zero helper. Add the repo's first `test` script (Vitest) and a green table-driven unit suite. Nothing else consumes the class yet — this ticket only stands the module up.

**Blocked by:** None — can start immediately.

**Status:** done

- [x] `DecodedInstruction` lives in `src/vcpu/`, built via `DecodedInstruction.from(rawNode)`, wrapping the raw node without copying/replacing it
- [x] Every fact currently in `src/utilities/instructions.ts` has an equivalent on the class interface (names stay close to existing vocabulary)
- [x] `memoryAccess()` returns `{ bytes, signed }` for loads/stores, `null` otherwise, derived once from funct3
- [x] `extend(bits)` is pure (bits in, bits out); sign vs zero chosen from the memory-access fact
- [x] Vitest is wired up with a `test` script; `npm test` (or equivalent) runs without a VS Code host
- [x] Table-driven fact matrix covers one instruction per type/opcode (`add`, `addi`, `lw`, `lb`, `lbu`, `sw`, `sb`, `beq`, `jal`, `jalr`, `lui`, `auipc`), asserting the full fact row + `memoryAccess()`
- [x] Targeted `extend()` cases: sign-extend `lb`, zero-extend `lbu`, and the `lh`/`lhu` 16-bit pair
- [x] `src/utilities/instructions.ts` is NOT modified or deleted in this ticket
