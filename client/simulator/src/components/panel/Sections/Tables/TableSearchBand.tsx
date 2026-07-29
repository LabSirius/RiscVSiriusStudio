import { ReactNode } from "react";
import { Search, X } from "lucide-react";

interface TableSearchBandProps {
  /** Live search string, owned by the table (its filter effect depends on it). */
  value: string;
  /** Called on every keystroke and on clear. Filtering is instant (no debounce). */
  onChange: (value: string) => void;
  placeholder?: string;
  /**
   * Right padding (rem) reserving space for controls that still float over the
   * table's top-right (data-memory's menu, program-memory's locate/collapse).
   * Ignored when `controls` is supplied (they sit inside the band instead).
   */
  reserveRightRem?: number;
  /** Controls rendered on the right of the band (e.g. the register collapse arrow). */
  controls?: ReactNode;
}

/**
 * A full-width search toolbar that sits on top of one table, scoped to that
 * table. Always visible (no expand toggle) — the search string is never hidden,
 * so there is no collapsed "active filter" state to signal. `✕` clears the text
 * and the filter. Controls passed via `controls` live in the band; controls the
 * table still floats top-right get room via `reserveRightRem`.
 */
const TableSearchBand = ({
  value,
  onChange,
  placeholder = "search…",
  reserveRightRem = 3,
  controls,
}: TableSearchBandProps) => (
  <div
    className="flex shrink-0 items-center gap-2 rounded-t-md border-b border-gray-300 bg-gray-100 px-2 py-1 dark:border-zinc-700 dark:bg-zinc-800"
    style={{ paddingRight: controls ? undefined : `${reserveRightRem}rem` }}>
    <Search strokeWidth={1.5} className="h-[1rem] w-[1rem] shrink-0 text-gray-500 dark:text-zinc-400" />
    <input
      type="text"
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="min-w-0 flex-1 bg-transparent text-[0.8rem] text-black outline-none placeholder:text-gray-400 dark:text-white dark:placeholder:text-zinc-500"
    />
    {value !== "" && (
      <button
        type="button"
        title="Clear search"
        onClick={() => onChange("")}
        className="shrink-0 text-gray-500 hover:text-black dark:text-zinc-400 dark:hover:text-white">
        <X strokeWidth={1.5} className="h-[0.9rem] w-[0.9rem]" />
      </button>
    )}
    {controls && <div className="flex shrink-0 items-center gap-1">{controls}</div>}
  </div>
);

export default TableSearchBand;
