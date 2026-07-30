# Program-memory search should match instruction text

Status: done
Type: grilling

Future ticket. Deferred from `01-per-table-search-toolbar` (spec Q2). Ships after 01.

## The gap

The per-table search (issue 01) matches the frozen field list
`["address","value3","value2","value1","value0","hex"]` on BOTH memory tables. That list is
all numeric/address data. But **program memory also shows disassembled instruction text**
(mnemonic, operands, asm source) — none of which the current search matches. A user staring
at a search box on the program-memory table will expect to type `addi`, `x17`, or a label
and find the row; today they get nothing.

## The idea (Q2 option B)

Give program-memory its own field list that additionally matches its instruction/asm
columns, so instruction-text search works. Data-memory keeps the numeric 6-field list.
(Per-table local state from issue 01 already makes divergent field lists trivial — nothing
locks them together.)

## Open decisions to grill

- Match the **rendered** disassembly string, the **raw** asm source, or both?
- Case sensitivity and tokenization — does `x17` match an operand mid-string? does `add`
  match `addi`?
- Does instruction-text matching coexist cleanly with numeric matching in one box (one
  substring `.includes` over a bigger field set), or do the two intents fight (e.g. a hex
  value that also reads as text)?
- Any highlight of the matched instruction, or row-filter only?

## Affected code

- `components/panel/Sections/Tables/MemoryTable/ProgramMemory.tsx` — the search effect's
  `fields` list.

## Resolution (2026-07-30, grill-with-docs)

Open decisions settled:

- **Fields:** match `asmText` (plain disassembly, e.g. `"addi x1, x0, 5"`) only, on top of
  the existing `address` + `hex`. The colored-bit `instructionencoding` and the symbol
  `info` label are HTML, so excluded (searching markup is noise). No label search.
- **Seam:** `matchesMemoryQuery` gained an optional `fields` param (defaults to the frozen
  data-memory list); new exported `PROGRAM_SEARCH_FIELDS = ["address","hex","asmText"]`.
  Data-memory call site + its frozen-list test untouched.
- **Semantics:** plain trimmed-lowercase substring — identical rule to data memory. `add`
  hits `addi`; `x17` hits mid-operand. No tokenization / multi-term.
- **Highlight:** filter-only, no cell paint (stays on the generic `setFilter` path; ADR-0007).

Docs: ADR-0007 gained a one-line "follow-up shipped" update. No new ADR (ADR-0007 already
predicted this), no CONTEXT.md change (`asmText` is implementation vocab, not domain).

Tests: `memorySearch.test.ts` — frozen data list stays green; added program-list cases
(mnemonic/operand/substring hits; HTML + value-byte queries miss). Full suite 126 green,
tsc + eslint clean.
