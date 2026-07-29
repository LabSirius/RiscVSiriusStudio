import { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";

interface TableSearchToolbarProps {
  /** The live search string, owned by the table (its filter effect depends on it). */
  value: string;
  /** Called on every keystroke and on clear. Filtering is instant (no debounce). */
  onChange: (value: string) => void;
  placeholder?: string;
  /**
   * Positioning wrapper class (each table anchors the toolbar in its own
   * top-right chrome, left of the collapse arrow).
   */
  className?: string;
}

/**
 * A magnifier icon that expands, in place, into a free-text search box scoped to
 * one table. Tidy at rest; `✕` clears the text and the filter. Collapsing with
 * text still present KEEPS the filter and marks the magnifier with an active
 * badge, so an applied-but-hidden filter is never invisible (spec Q6/Q6a).
 *
 * Controlled: the table owns `value` (its `setFilter`/`filterRegisters` effect
 * reads it); this component owns only the expand/collapse chrome.
 */
const TableSearchToolbar = ({
  value,
  onChange,
  placeholder = "search…",
  className = "",
}: TableSearchToolbarProps) => {
  const [expanded, setExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (expanded) inputRef.current?.focus();
  }, [expanded]);

  const hasFilter = value.trim() !== "";

  const clear = () => {
    onChange("");
    setExpanded(false);
  };

  return (
    <div className={`z-100 flex items-center ${className}`}>
      {expanded ? (
        <div className="flex items-center gap-1 rounded-md border border-gray-400 bg-white px-1 shadow-sm dark:border-zinc-600 dark:bg-zinc-800">
          <button
            type="button"
            title="Collapse search"
            onClick={() => setExpanded(false)}
            className="text-gray-500 hover:text-black dark:text-zinc-400 dark:hover:text-white">
            <Search strokeWidth={1.5} className="h-[1.1rem] w-[1.1rem]" />
          </button>
          <input
            ref={inputRef}
            type="text"
            value={value}
            placeholder={placeholder}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") clear();
            }}
            className="w-[8rem] bg-transparent py-[0.15rem] text-[0.8rem] text-black outline-none placeholder:text-gray-400 dark:text-white dark:placeholder:text-zinc-500"
          />
          <button
            type="button"
            title="Clear search"
            onClick={clear}
            className="text-gray-500 hover:text-black dark:text-zinc-400 dark:hover:text-white">
            <X strokeWidth={1.5} className="h-[1.1rem] w-[1.1rem]" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          title={hasFilter ? "Search (filter active)" : "Search"}
          onClick={() => setExpanded(true)}
          className="relative cursor-pointer text-black hover:scale-110 transition-transform dark:text-white">
          <Search strokeWidth={1.5} className="min-h-[1.3rem] min-w-[1.3rem] h-[1.3rem] w-[1.3rem]" />
          {hasFilter && (
            <span
              aria-label="filter active"
              className="absolute -right-[0.1rem] -top-[0.1rem] block h-[0.5rem] w-[0.5rem] rounded-full bg-blue-500 ring-1 ring-white dark:bg-sky-400 dark:ring-zinc-900"
            />
          )}
        </button>
      )}
    </div>
  );
};

export default TableSearchToolbar;
