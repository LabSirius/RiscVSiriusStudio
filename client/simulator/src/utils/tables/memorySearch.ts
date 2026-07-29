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
 * The frozen field list, address-first. Program-memory instruction-text search
 * is deliberately excluded (deferred to issue 02).
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
 * True when `query` (trimmed, lowercased) is a substring of any searched field
 * on `data`. A blank query matches nothing — callers clear the filter outright
 * rather than pushing an empty predicate.
 */
export function matchesMemoryQuery(data: Record<string, unknown>, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (q === "") return false;
  return MEMORY_SEARCH_FIELDS.some((f) => String(data[f] ?? "").toLowerCase().includes(q));
}
