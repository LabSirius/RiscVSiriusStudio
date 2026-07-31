import { useEffect, useMemo, useRef, useState } from "react";
import { CellComponent, ColumnDefinition, RowComponent } from "tabulator-tables";
import "./tabulator.css";

import { useMemoryTable } from "@/context/shared/MemoryTableContext";
import { useRegistersTable } from "@/context/panel/RegisterTableContext";
import { useSimulator } from "@/context/shared/SimulatorContext";
import { useTheme } from "@/components/ui/theme/theme-provider";
import { useRegisterData } from "@/context/shared/RegisterData";
import { useCustomOptionSimulate } from "@/context/shared/CustomOptionSimulate";

import { createViewTypeFormatter } from "@/utils/tables/handlersRegisters";
import { getColumnsRegisterDefinitions } from "@/utils/tables/definitions/definitionsColumns";
import {
  buildRegisterRows,
  resetRegisterRows,
  setRowValue,
  setRowWatched,
  setRowViewType,
  pad32,
  RegisterRow,
} from "@/utils/tables/registerRows";
import { RegisterView } from "@/utils/tables/types";
import { sendWebviewMessage } from "@/components/Message/sendMessage";

import SkeletonRegisterTable from "@/components/panel/Skeleton/SkeletonRegisterTable";
import { ArrowBigLeftDash, ArrowBigRightDash, Eye } from "lucide-react";

import { SimulatorTable, SimulatorTableHandle } from "./SimulatorTable";
import TableSearchBand from "./TableSearchBand";
import ToolbarToggle from "./ToolbarToggle";

// The radix keys map to the persistent viewType (candidate B keeps the transient
// hover-peek in attachConvertionToggle; this only sets the stored view). Folded
// out of the deleted useGlobalKeyboardShortcuts hook.
const VIEW_KEYS: Record<string, RegisterView> = {
  b: 2,
  s: "signed",
  u: "unsigned",
  h: 16,
  a: "ascii",
};

/**
 * The single register table — one adapter of SimulatorTable (ADR-0006). Replaces
 * the seven imperative hooks (useTabulator, useRegisterUpdates,
 * useImportRegisterData, useUpdateTableColumns, useTableFilter,
 * useResetRegistersOnNewSimulation, useGlobalKeyboardShortcuts) and the
 * `reactiveData: true` model with a declarative `rows` state that is the single
 * source of truth. Every mutation (edit, write, watched toggle, viewType change,
 * import, reset) returns a new array fed through `setData`, which re-groups by
 * `watched`. The radix representation (valueFormatter, attachConvertionToggle)
 * is untouched — architecture-review candidate B.
 */
const RegistersTable = () => {
  const { theme } = useTheme();
  const { isCreatedMemoryTable } = useMemoryTable();
  const { registerData, setRegisterData } = useRegisterData();
  const { writeInRegister, setWriteInRegister } = useRegistersTable();
  const {
    checkFixedRegisters,
    setCheckFixedRegisters,
    fixedchangedRegisters,
    setFixedchangedRegisters,
  } = useCustomOptionSimulate();
  const { isFirstStep } = useSimulator();

  const [showTable, setShowTable] = useState(true);
  const [ready, setReady] = useState(false);
  const [rows, setRows] = useState<RegisterRow[]>(() => buildRegisterRows(registerData));
  // Per-table search string (was RegisterTableContext.searchInRegisters). Local
  // so it filters only this table; the register-specific paint stays underneath.
  const [search, setSearch] = useState("");

  const handleRef = useRef<SimulatorTableHandle | null>(null);
  const themeRef = useRef(theme);
  themeRef.current = theme;
  const pendingWriteRef = useRef<{ registerName: string; value: string } | null>(null);

  // The viewType cell currently hovered, set by the formatter — the radix
  // keypress (b/s/u/h/a) targets this row.
  const hoveredViewTypeCell = useRef<CellComponent | null>(null);
  const viewTypeFormatterCustom = useMemo(
    () =>
      createViewTypeFormatter((cell) => {
        hoveredViewTypeCell.current = cell;
      }),
    []
  );

  // Columns rebuilt on isFirstStep / theme (the column-swap that replaces
  // useUpdateTableColumns); SimulatorTable's setColumns effect applies them. The
  // Name column's watched-toggle click is routed into `rows` state so setData
  // re-groups, rather than mutating the instance.
  const columns = useMemo<ColumnDefinition[]>(() => {
    const cols = getColumnsRegisterDefinitions(viewTypeFormatterCustom, isFirstStep, theme);
    return cols.map((col) =>
      col.field === "name"
        ? {
            ...col,
            cellClick: (_e: UIEvent, cell: CellComponent) => {
              const { rawName, watched } = cell.getData();
              setRows((rs) => setRowWatched(rs, rawName, !watched));
            },
          }
        : col
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFirstStep, theme, viewTypeFormatterCustom]);

  const options = useMemo(
    () => ({
      index: "rawName",
      groupBy: "watched",
      groupValues: [[true, false]],
      groupHeader: (value: unknown, count: number) =>
        `${value ? "Watched" : "Unwatched"} (${count} registers)`,
      movableRows: true,
      // The write pulse lives here, not in a handle call: setData re-groups and
      // rebuilds row DOM, so a class must be reapplied from row data on every
      // redraw (ADR-0006 gotcha #2). The component clears `flash` after 500ms.
      rowFormatter: (row: RowComponent) => {
        if ((row.getData() as RegisterRow).flash) {
          row.getElement().classList.add("animate-cell");
        }
      },
    }),
    []
  );

  // --- Reset on a new simulation (replaces useResetRegistersOnNewSimulation). ---
  useEffect(() => {
    if (!isCreatedMemoryTable) {
      setFixedchangedRegisters([]);
      setRegisterData(Array(32).fill("0".repeat(32)));
      setRows(resetRegisterRows());
    }
  }, [isCreatedMemoryTable, setRegisterData, setFixedchangedRegisters]);

  // --- Host / SP / manual register write (replaces useRegisterUpdates). ---
  const processWrite = (write: { registerName: string; value: string }) => {
    if (write.value === "" || write.registerName === "x0") return;
    const index = Number(write.registerName.replace("x", ""));
    const rawName = write.registerName;

    setRows((rs) => {
      let next = setRowValue(rs, index, write.value);
      if (checkFixedRegisters) next = setRowWatched(next, rawName, true);
      return next.map((r) => (r.rawName === rawName ? { ...r, flash: true } : r));
    });
    setRegisterData((prev) => {
      const next = [...prev];
      next[index] = pad32(write.value);
      return next;
    });

    // Scroll after the setData re-group has rebuilt the rows; clear the pulse
    // marker after 500ms so the next setData drops the animate-cell class.
    const position = index >= 0 && index <= 12 ? "center" : "top";
    setTimeout(() => handleRef.current?.scrollToRow(rawName, position), 0);
    setTimeout(() => {
      setRows((rs) => rs.map((r) => (r.rawName === rawName ? { ...r, flash: false } : r)));
    }, 500);
    setFixedchangedRegisters((prev) => [...prev, rawName]);
  };

  useEffect(() => {
    if (writeInRegister.value === "") return;
    if (ready) {
      processWrite(writeInRegister);
      setWriteInRegister({ registerName: "", value: "" });
    } else {
      pendingWriteRef.current = writeInRegister;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [writeInRegister]);

  useEffect(() => {
    if (ready && pendingWriteRef.current) {
      processWrite(pendingWriteRef.current);
      pendingWriteRef.current = null;
      setWriteInRegister({ registerName: "", value: "" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  // --- Auto-watch every fixed-changed register when the option is on
  // (the third effect of the old useRegisterUpdates). ---
  useEffect(() => {
    if (!ready || !checkFixedRegisters) return;
    setRows((rs) => {
      let changed = false;
      const next = rs.map((r) => {
        if (fixedchangedRegisters.includes(r.rawName) && !r.watched) {
          changed = true;
          return { ...r, watched: true };
        }
        return r;
      });
      return changed ? next : rs;
    });
  }, [checkFixedRegisters, ready, fixedchangedRegisters]);

  // --- Radix keypress → persistent viewType (folded useGlobalKeyboardShortcuts). ---
  useEffect(() => {
    if (!ready) return;
    const handler = (e: KeyboardEvent) => {
      const view = VIEW_KEYS[e.key.toLowerCase()];
      const cell = hoveredViewTypeCell.current;
      if (view === undefined || !cell) return;
      const { rawName } = cell.getData();
      setRows((rs) => setRowViewType(rs, rawName, view));
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [ready]);

  // --- Search: filter + colour matching cells (replaces useTableFilter). ---
  useEffect(() => {
    if (!ready) return;
    if (search.trim() === "") {
      handleRef.current?.clearRegisterFilter();
    } else {
      handleRef.current?.filterRegisters(search, themeRef.current);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, ready]);

  const onEdit = (row: RegisterRow, cell: CellComponent) => {
    const field = cell.getField();
    if (field === "value") {
      const value = pad32(String(row.value));
      setRows((rs) => setRowValue(rs, row.id, value));
      setRegisterData((prev) => {
        const next = [...prev];
        next[row.id] = value;
        sendWebviewMessage({ event: "registersChanged", registers: next });
        return next;
      });
    } else if (field === "viewType") {
      setRows((rs) => setRowViewType(rs, row.rawName, row.viewType));
    }
  };

  const onReady = (handle: SimulatorTableHandle) => {
    handleRef.current = handle;
    setReady(true);
  };

  return (
    <>
      <div
        id="registerTable"
        className={`shadow-lg flex flex-col min-h-min max-h-[calc(100dvh-2.3rem)] mx-4 ${
          !showTable && "hidden"
        } min-w-[22.7rem] relative `}>
        {!ready && <SkeletonRegisterTable />}
        {/* The register table stands alone: it mounts at launch, independent of
            the memory tables. (It formerly gated on `isCreatedMemoryTable`, a
            one-shot memory-built signal that `uploadMemory` resets — the flip
            unmounted this table while `ready` stayed true, stranding a blank.)
            The block fades in on its own `ready`, so the absolute skeleton
            covers it cleanly until Tabulator builds. */}
        <div
          className={`flex h-full w-full flex-col transition-opacity ease-in ${
            ready ? "opacity-100" : "opacity-0"
          }`}>
          {/* Search toolbar on top; the collapse arrow lives inside it. */}
          <TableSearchBand
            value={search}
            onChange={setSearch}
            placeholder="e.g x17 or 12 or 1100 or 0xC"
            controls={
              <>
                <ToolbarToggle
                  active={checkFixedRegisters}
                  title={
                    checkFixedRegisters
                      ? "Auto-add changing registers to the watch list: on"
                      : "Auto-add changing registers to the watch list: off"
                  }
                  onClick={() => setCheckFixedRegisters((v) => !v)}
                  icon={Eye}
                />
                <ArrowBigLeftDash
                  id="closeRT"
                  onClick={() => setShowTable(false)}
                  strokeWidth={1.5}
                  className="min-w-[1.3rem] min-h-[1.3rem] w-[1.3rem] h-[1.3rem] cursor-pointer text-black dark:text-white"
                />
              </>
            }
          />
          <SimulatorTable<RegisterRow>
            className={`w-full min-h-0 flex-1 ${theme === "light" ? "theme-light" : "theme-dark"}`}
            columns={columns}
            data={rows}
            options={options}
            onEdit={onEdit}
            onReady={onReady}
          />
        </div>
      </div>
      {!showTable && (
        <div
          onClick={() => setShowTable(true)}
          className={`h-full w-[1.6rem] cursor-pointer rounded-[.2rem] border flex flex-col items-center uppercase hover:opacity-[0.9] transition-all ease-in-out duration-200
    bg-[#FFF9C4] border-gray-700 text-black`}>
          <ArrowBigRightDash
            strokeWidth={1.5}
            className={`mt-[0.35rem] mb-1  min-w-[.9rem] min-h-[.9rem] w-[.9rem] h-[.9rem]
      `}
          />

          {"registers".split("").map((char, index) => (
            <span
              key={index}
              className={`text-[.45rem] font-bold leading-[.91rem]  ease-in-out
        `}>
              {char === " " ? " " : char}
            </span>
          ))}
        </div>
      )}
    </>
  );
};

export default RegistersTable;
