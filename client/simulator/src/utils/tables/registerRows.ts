import { registersNames } from "@/components/panel/Sections/constants/data";
import { RegisterView } from "@/utils/tables/types";

/**
 * Pure row model for the register table — the internal seam behind
 * SimulatorTable's declarative `data` prop (ADR-0006). Previously the register
 * rows lived only inside a `reactiveData: true` Tabulator instance and were
 * mutated in place (`row.update`, `updateData`, `setGroupBy`) by seven imperative
 * hooks. Here the row array is React state the component owns; every mutation
 * (value edit/write, watched toggle, viewType change, import, reset) returns a
 * new array the component feeds back through `setData`, which re-groups.
 *
 * `viewType` lives in this state precisely so a `setData` cannot wipe a radix
 * choice — the radix representation itself (valueFormatter, attachConvertionToggle)
 * stays untouched (architecture-review candidate B).
 */

export interface RegisterRow {
  name: string;
  rawName: string;
  value: string;
  viewType: RegisterView;
  watched: boolean;
  modified: number;
  id: number;
  /**
   * Transient per-write pulse marker. Owned by the table's rowFormatter (not a
   * handle-added class) because the register table groups by `watched`: every
   * `setData` re-groups and rebuilds the row DOM, which would wipe a class added
   * imperatively. The formatter re-applies `animate-cell` from this flag on each
   * redraw; the component clears it after the pulse. See ADR-0006 gotcha #2.
   */
  flash?: boolean;
  [key: string]: unknown;
}

const ZERO_WORD = "0".repeat(32);

/** Pad a register value to 32 bits, matching the old cellEdited/write behaviour. */
export const pad32 = (value: string): string => (value.length < 32 ? value.padStart(32, "0") : value);

/**
 * Build the 32 register rows from a values array (one 32-bit binary string per
 * register). Mirrors the `registersNames.map(...)` seed the old `useTabulator`
 * built: `rawName` is the `xN` prefix, the table index; viewType defaults to hex.
 */
export const buildRegisterRows = (values: string[]): RegisterRow[] =>
  registersNames.map((name, id) => ({
    name,
    rawName: name.split(" ")[0],
    value: values[id] ?? ZERO_WORD,
    viewType: 16 as RegisterView,
    watched: false,
    modified: 0,
    id,
  }));

/** Fresh rows for a new simulation: all zero, unwatched, hex. */
export const resetRegisterRows = (): RegisterRow[] => buildRegisterRows(Array(32).fill(ZERO_WORD));

/** Set a register's value by table index, padding to 32 bits. Returns a new array. */
export const setRowValue = (rows: RegisterRow[], id: number, value: string): RegisterRow[] =>
  rows.map((r) => (r.id === id ? { ...r, value: pad32(value) } : r));

/** Toggle/set the watched flag of the row whose `rawName` matches. New array. */
export const setRowWatched = (rows: RegisterRow[], rawName: string, watched: boolean): RegisterRow[] =>
  rows.map((r) => (r.rawName === rawName ? { ...r, watched } : r));

/** Set the viewType (radix) of the row whose `rawName` matches. New array. */
export const setRowViewType = (
  rows: RegisterRow[],
  rawName: string,
  viewType: RegisterView
): RegisterRow[] => rows.map((r) => (r.rawName === rawName ? { ...r, viewType } : r));

/** Project the row values back to the flat values array (for host sync / export). */
export const rowsToValues = (rows: RegisterRow[]): string[] => {
  const values = Array(registersNames.length).fill(ZERO_WORD);
  rows.forEach((r) => {
    if (r.id >= 0 && r.id < values.length) values[r.id] = r.value;
  });
  return values;
};
