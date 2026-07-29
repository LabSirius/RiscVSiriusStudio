import { chunk } from "lodash";
import { intToHex } from "@/utils/handlerConversions";

/**
 * Pure row model for the available-memory table — the internal seam behind
 * SimulatorTable's declarative `data` prop (ADR-0006). Previously this logic was
 * imperative Tabulator poking (`uploadAvailableMemory`, `writeInMemoryCell`,
 * `setSP`, `updateHexValue`): it built rows, wrote bytes, and moved the Heap/SP
 * labels by mutating the live table. Here it is a set of pure functions the
 * component composes into the row array; node-testable, no DOM.
 */

export interface AvailableRow {
  address: string;
  value0: string;
  value1: string;
  value2: string;
  value3: string;
  hex: string;
  info: string;
  segment: string;
  /**
   * Value fields last written this run, kept coloured by the rowFormatter. Data,
   * not a DOM class, so the colour survives the declarative `setData` re-render
   * (the old imperative path left `written-cell` on the DOM until the next
   * redraw; here it is reapplied on every render from this marker).
   */
  writtenFields?: string[];
  [key: string]: unknown;
}

const EMPTY_BYTE = "00000000";

/** Invisible placeholder that keeps an unlabelled Info cell at row height. */
export const INFO_PLACEHOLDER = '<div style="opacity:0"> </div>';

const labelSpan = (text: string): string =>
  `<span class="text-white text-[0.7rem] bg-[#3A6973] p-[.4rem] rounded-md text-center">${text}</span>`;

/** HEX column value ("XX-XX-XX-XX", high byte first) for a word's four bytes. */
export const rowHex = (value0: string, value1: string, value2: string, value3: string): string =>
  [value3, value2, value1, value0]
    .map((b) => parseInt(b || EMPTY_BYTE, 2).toString(16).toUpperCase().padStart(2, "0"))
    .join("-");

/**
 * Build the base rows from a flat byte array (one 8-bit binary string per byte,
 * four bytes per word). Segment classification mirrors `uploadAvailableMemory`.
 * Labels (Heap / SP) are applied separately by {@link withLabels}.
 */
export const buildAvailableRows = (
  memory: string[],
  writableSize: number | null | undefined,
  readOnlySize: number | null | undefined
): AvailableRow[] =>
  chunk(memory, 4).map((word, index) => {
    const byteAddress = index * 4;
    const address = intToHex(byteAddress).toUpperCase();

    let segment: string;
    if (readOnlySize && byteAddress < readOnlySize) {
      segment = "directivesReadOnlySize";
    } else if (writableSize && byteAddress - (readOnlySize ?? 0) < writableSize) {
      segment = "directivesWritableSize";
    } else {
      segment = "memory";
    }

    const [value0, value1, value2, value3] = [
      word[0] || EMPTY_BYTE,
      word[1] || EMPTY_BYTE,
      word[2] || EMPTY_BYTE,
      word[3] || EMPTY_BYTE,
    ];

    return {
      address,
      value0,
      value1,
      value2,
      value3,
      hex: rowHex(value0, value1, value2, value3),
      info: "",
      segment,
    };
  });

const blankRow = (address: string): AvailableRow => ({
  address,
  value0: EMPTY_BYTE,
  value1: EMPTY_BYTE,
  value2: EMPTY_BYTE,
  value3: EMPTY_BYTE,
  hex: "00-00-00-00",
  info: "",
  segment: "",
});

/**
 * Apply the Heap and SP labels to a set of base rows, returning a new array.
 * Because labels are recomputed from scratch each call, moving the SP (or
 * resizing the Heap) is just "recompute rows" — the previous label clears
 * itself, replacing the old imperative `setSP` prev-clearing dance. Rows for the
 * Heap/SP addresses are appended if absent, matching the old upload behaviour.
 */
export const withLabels = (
  rows: AvailableRow[],
  heapAddress: string | undefined,
  spAddress: string | undefined
): AvailableRow[] => {
  const out = rows.map((r) => ({ ...r }));
  const ensure = (address: string) => {
    if (!out.some((r) => r.address === address)) out.push(blankRow(address));
  };
  if (heapAddress) ensure(heapAddress);
  if (spAddress) ensure(spAddress);

  return out.map((r) => {
    let info = "";
    if (spAddress && r.address === spAddress) info = labelSpan("SP");
    else if (heapAddress && r.address === heapAddress) info = labelSpan("Heap");
    return { ...r, info: info || INFO_PLACEHOLDER };
  });
};

/**
 * Write `leng` bytes (1, 2, or 4) of a 32-bit binary `value` into a word row,
 * LSB → value0, and recompute its HEX. Mirrors the byte-slicing of the old
 * `writeInMemoryCell`. Returns a new row; does not mutate the input.
 */
export const writeRowBytes = (row: AvailableRow, leng: number, value: string): AvailableRow => {
  const next = { ...row };
  if (leng === 1) {
    next.value0 = value.substring(24, 32);
  } else if (leng === 2) {
    next.value1 = value.substring(16, 24);
    next.value0 = value.substring(24, 32);
  } else if (leng === 4) {
    next.value3 = value.substring(0, 8);
    next.value2 = value.substring(8, 16);
    next.value1 = value.substring(16, 24);
    next.value0 = value.substring(24, 32);
  }
  next.hex = rowHex(next.value0, next.value1, next.value2, next.value3);
  return next;
};

/** The value fields a write/read of `leng` bytes touches, LSB first — for the flash. */
export const touchedFields = (leng: number): string[] =>
  (["value0", "value1", "value2", "value3"] as const).slice(0, leng === 4 ? 4 : leng);
