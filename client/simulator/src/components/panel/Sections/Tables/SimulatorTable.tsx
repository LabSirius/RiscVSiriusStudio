import { useEffect, useRef } from "react";
import {
  TabulatorFull as Tabulator,
  Options,
  ColumnDefinition,
  CellComponent,
} from "tabulator-tables";
import { mergeOptions } from "@/utils/tables/mergeOptions";
import {
  createPCIcon,
  animateRow,
  animateArrowBetweenCells,
  setupInstructionTooltips,
} from "@/utils/tables/handlersMemory";
import { filterTableData } from "@/utils/tables/handlersRegisters";
import { resetCellColors } from "@/utils/tables/handlersShared";

/**
 * The imperative escape hatch (ADR-0006). SimulatorTable is declarative for
 * columns, data, and edits; the one thing that stays imperative is transient,
 * time-based cell animation — a flash class applied for a few hundred ms — and
 * the scroll that follows it. Callers reach these through the handle rather
 * than holding the Tabulator instance.
 */
export interface SimulatorTableHandle {
  /**
   * Flash the given fields of the row at `index` by adding `classNames` for
   * `ms`, then removing them. Used for the per-clock write/read highlight.
   */
  flashCells(index: string, fields: string[], classNames: string[], ms?: number): void;
  /** Scroll the row at `index` into view. */
  scrollToRow(index: string, position?: "top" | "center" | "bottom"): void;
  /** Filter to rows matching the predicate. A transient view op — data is unchanged. */
  setFilter(predicate: (row: Record<string, unknown>) => boolean): void;
  /** Clear any active filter. */
  clearFilter(): void;
  /** Move the PC locate icon onto the row whose address (hex) is `pcHex`. */
  markPc(pcHex: string): void;
  /** Pulse-highlight the row at byte `address` — the program editor-click locate. */
  animateRow(address: number): void;
  /** Draw the transient jump arrow between the address cells at two byte addresses. */
  animateArrow(fromAddress: number, toAddress: number): void;
  /**
   * Attach the riscv-segment hover tooltips to this table's DOM. A program-memory
   * behaviour reached through the handle, symmetrical with the animations above;
   * SimulatorTable itself stays free of any program-specific concept.
   */
  setupTooltips(): void;
  /**
   * Register search: filter rows and colour the matching name/value cells. A
   * transient view op reached through the handle (ADR-0006), keeping the fiddly
   * `filterTableData` matching untouched. Declarative reimplementation is a
   * future ticket (.scratch/register-search-declarative).
   */
  filterRegisters(search: string, theme: string): void;
  /** Clear the register filter and reset the search cell colours. */
  clearRegisterFilter(): void;
  /** Force a full re-render (re-runs the rowFormatter), e.g. after a theme change. */
  redraw(): void;
}

export interface SimulatorTableProps<T extends Record<string, unknown>> {
  /** Column definitions. Tabulator's type crosses the seam here by design (ADR-0006). */
  columns: ColumnDefinition[];
  /** Declarative row data. On change, the module diffs it into the table. */
  data: T[];
  /**
   * Per-table divergent render knobs (`index`, `initialSort`, `groupBy`,
   * `movableRows`, `rowFormatter`, …), merged over the module's owned defaults.
   * Lifecycle, data-sync, and the edit relay are owned and cannot be set here.
   */
  options?: Partial<Options>;
  /** Fired when an editable cell commits. The caller relays the webview message. */
  onEdit?: (row: T, cell: CellComponent) => void;
  /** Fired once the table has built, handing back the imperative handle. */
  onReady?: (handle: SimulatorTableHandle) => void;
  className?: string;
  id?: string;
}

/**
 * SimulatorTable — the one deep table module every Shell table is an adapter of
 * (see CONTEXT.md, ADR-0006). It owns a single Tabulator lifecycle behind a
 * small declarative interface; no caller holds a Tabulator instance.
 *
 * This collapses the four copy-pasted `new Tabulator(...)` lifecycle hooks and
 * the near-verbatim data-memory components into one place: the create / build /
 * destroy dance, the declarative data-sync, and the `cellEdited` relay live
 * here once.
 */
export function SimulatorTable<T extends Record<string, unknown>>({
  columns,
  data,
  options,
  onEdit,
  onReady,
  className,
  id,
}: SimulatorTableProps<T>) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const instanceRef = useRef<Tabulator | null>(null);
  const builtRef = useRef(false);

  // Latest callbacks/data, read by effects and Tabulator event handlers without
  // re-creating the instance on every render.
  const onEditRef = useRef(onEdit);
  const onReadyRef = useRef(onReady);
  const dataRef = useRef(data);
  onEditRef.current = onEdit;
  onReadyRef.current = onReady;
  dataRef.current = data;

  // Create / destroy the instance once. Columns and options are read at mount;
  // per-clock variation flows through `data` and the handle, not re-creation.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!containerRef.current || instanceRef.current) return;

    const base: Partial<Options> = {
      layout: "fitColumns",
      renderVertical: "virtual",
      columns,
      data: dataRef.current as Record<string, unknown>[],
    };

    const instance = new Tabulator(containerRef.current, mergeOptions(base, options));
    instanceRef.current = instance;

    instance.on("tableBuilt", () => {
      builtRef.current = true;
      onReadyRef.current?.(makeHandle(instance));
    });

    instance.on("cellEdited", (cell: CellComponent) => {
      onEditRef.current?.(cell.getData() as T, cell);
    });

    return () => {
      builtRef.current = false;
      instance.destroy();
      instanceRef.current = null;
    };
    // Intentionally mount-once: columns/options are captured at creation, data
    // and callbacks are kept live through refs.
  }, []);

  // Declarative data-sync: push new rows into the built table.
  useEffect(() => {
    const instance = instanceRef.current;
    if (!instance || !builtRef.current) return;
    instance.setData(data as Record<string, unknown>[]);
  }, [data]);

  // Live column changes (e.g. the memory table's bin↔hex visibility toggle).
  useEffect(() => {
    const instance = instanceRef.current;
    if (!instance || !builtRef.current) return;
    instance.setColumns(columns);
  }, [columns]);

  return <div ref={containerRef} className={className} id={id} />;
}

function makeHandle(instance: Tabulator): SimulatorTableHandle {
  return {
    flashCells(index, fields, classNames, ms = 500) {
      const row = instance.getRow(index);
      if (!row) return;
      const rowEl = row.getElement();
      const cells = fields
        .map((f) => rowEl.querySelector(`div[tabulator-field="${f}"]`))
        .filter((el): el is HTMLElement => el instanceof HTMLElement);
      cells.forEach((el) => el.classList.add(...classNames));
      setTimeout(() => cells.forEach((el) => el.classList.remove(...classNames)), ms);
    },
    scrollToRow(index, position = "center") {
      instance.scrollToRow(index, position, true).catch(() => {
        /* row not present (filtered/removed) — nothing to scroll to */
      });
    },
    setFilter(predicate) {
      instance.setFilter(predicate as never);
    },
    clearFilter() {
      instance.clearFilter(true);
    },
    markPc(pcHex) {
      // Reset every address cell (drops any stale PC icon), then place the icon
      // on the matching row — ported from the old imperative `updatePC`.
      instance.getRows().forEach((row) => {
        const cell = row.getCell("address");
        if (!cell) return;
        const el = cell.getElement();
        const value = cell.getValue();
        while (el.firstChild) el.removeChild(el.firstChild);
        const span = document.createElement("span");
        span.className = "address-value";
        span.innerText = value;
        el.appendChild(span);
      });

      const found = instance.searchRows("address", "=", pcHex);
      const cell = found[0]?.getCell("address");
      if (!cell) return;
      const el = cell.getElement();
      el.style.position = "relative";
      el.appendChild(createPCIcon());
      el.classList.add("animate-pc");
      void el.offsetWidth;
      setTimeout(() => el.classList.remove("animate-pc"), 300);
    },
    animateRow(address) {
      animateRow(instance, address);
    },
    animateArrow(fromAddress, toAddress) {
      animateArrowBetweenCells(instance, fromAddress, toAddress);
    },
    setupTooltips() {
      setupInstructionTooltips(instance);
    },
    filterRegisters(search, theme) {
      filterTableData(search, instance, theme);
    },
    clearRegisterFilter() {
      instance.clearFilter(true);
      resetCellColors(instance);
    },
    redraw() {
      instance.redraw(true);
    },
  };
}
