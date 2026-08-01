/**
 * Data-memory sizing rules, shared by the extension host (which builds the CPU
 * with the chosen size) and the webview client (which validates the start-time
 * input). One source of truth so the two bundles cannot drift.
 */

export const MIN_MEMORY_BYTES = 4;
export const MAX_MEMORY_BYTES = 4096;

/** A size is usable when it is a word-aligned integer within bounds. */
export function isValidMemorySize(bytes: number): boolean {
  return (
    Number.isInteger(bytes) &&
    bytes >= MIN_MEMORY_BYTES &&
    bytes <= MAX_MEMORY_BYTES &&
    bytes % 4 === 0
  );
}

export function bytesToWords(bytes: number): number {
  return Math.floor(bytes / 4);
}
