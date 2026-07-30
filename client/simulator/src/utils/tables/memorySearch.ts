/**
 * Memory-table free-text search: the single query is matched, as a
 * case-insensitive substring, across a frozen list of six fields on each row.
 * Both the data-memory and program-memory tables share this predicate (their
 * search boxes are per-table and independent, but the match rule is identical).
 *
 * This is the pure core behind each table's `setFilter` effect; the fiddly,
 * DOM-touching register search stays in `handlersRegisters.ts` (ADR-0007).
 */

/**
 * The frozen field list for the data-memory table, address-first — all
 * numeric/address data. This is the default field set.
 */
export const MEMORY_SEARCH_FIELDS = [
  "address",
  "value3",
  "value2",
  "value1",
  "value0",
  "hex",
] as const;

/**
 * The program-memory field list: address + hex (as the data table has), plus
 * `asmText`, the plain-text disassembly (e.g. "addi x1, x0, 5"), so a user can
 * type a mnemonic or register operand and filter to the row (issue 02). The
 * program rows carry no value bytes, and the colored-bit encoding and symbol
 * label are HTML, so they are deliberately excluded (searching markup is noise).
 */
export const PROGRAM_SEARCH_FIELDS = ["address", "hex", "asmText"] as const;

/**
 * True when `query` (trimmed, lowercased) is a substring of any searched field
 * on `data`. A blank query matches nothing — callers clear the filter outright
 * rather than pushing an empty predicate. `fields` defaults to the data-memory
 * list; the program-memory table passes `PROGRAM_SEARCH_FIELDS`.
 */
export function matchesMemoryQuery(
  data: Record<string, unknown>,
  query: string,
  fields: readonly string[] = MEMORY_SEARCH_FIELDS
): boolean {
  const q = query.trim().toLowerCase();
  if (q === "") return false;
  return fields.some((f) => String(data[f] ?? "").toLowerCase().includes(q));
}
