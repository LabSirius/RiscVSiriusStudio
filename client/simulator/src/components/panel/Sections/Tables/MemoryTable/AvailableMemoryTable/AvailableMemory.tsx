import { useEffect, useMemo, useRef, useState } from "react";
import { CellComponent, RowComponent } from "tabulator-tables";
import "../../tabulator.css";

import { useMemoryTable } from "@/context/shared/MemoryTableContext";
import { useRegistersTable } from "@/context/panel/RegisterTableContext";
import { useSimulator } from "@/context/shared/SimulatorContext";
import { useTheme } from "@/components/ui/theme/theme-provider";

import SkeletonMemoryTable from "@/components/panel/Skeleton/SkeletonMemoryTable";
import { ArrowBigLeftDash, ArrowBigRightDash, Binary, Menu } from "lucide-react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

import { SimulatorTable, SimulatorTableHandle } from "../../SimulatorTable";
import TableSearchBand from "../../TableSearchBand";
import { buildMemoryColumns } from "@/utils/tables/definitions/memoryColumns";
import { matchesMemoryQuery } from "@/utils/tables/memorySearch";
import {
  buildAvailableRows,
  withLabels,
  writeRowBytes,
  rowHex,
  touchedFields,
  AvailableRow,
} from "@/utils/tables/availableRows";
import { intToHex, intTo32BitBinary, binaryToInt } from "@/utils/handlerConversions";
import { sendMessage, sendWebviewMessage } from "@/components/Message/sendMessage";

interface AvailableMemoryProps {
  withBin: boolean;
  setWithBin: React.Dispatch<React.SetStateAction<boolean>>;
}

const hexUpper = (n: number): string => intToHex(n).toUpperCase();

/**
 * The single available-memory table — one adapter of SimulatorTable
 * (ADR-0006). Replaces the two near-verbatim components (`AvailableMemoryTable`
 * + `AvailableHexMemoryTable`) and their four+ imperative Tabulator hooks. The
 * byte data is a declarative row array (`baseRows` → labelled `displayRows`);
 * the Heap/SP labels, segment colours, writes, reads, resize, import, and
 * search filter are all expressed over that array or the SimulatorTable handle.
 */
const AvailableMemory = ({ withBin, setWithBin }: AvailableMemoryProps) => {
  const { theme } = useTheme();
  const {
    setIsCreatedMemoryTable,
    dataMemoryTable,
    setDataMemoryTable,
    sizeMemory,
    sp,
    setSp,
    importMemory,
    setImportMemory,
    writeInMemory,
    setWriteInMemory,
    readInMemory,
    setReadInMemory,
  } = useMemoryTable();

  const { newPc, isFirstStep } = useSimulator();
  const { writeInRegister, setWriteInRegister } = useRegistersTable();

  const [showTable, setShowTable] = useState(true);
  const [ready, setReady] = useState(false);
  const [baseRows, setBaseRows] = useState<AvailableRow[]>([]);
  // Per-table search string (was the shared MemoryTableContext.searchInMemory
  // that filtered both memory tables at once). Local so it scopes to this table.
  const [search, setSearch] = useState("");

  const handleRef = useRef<SimulatorTableHandle | null>(null);
  const isFirstStepRef = useRef(isFirstStep);
  isFirstStepRef.current = isFirstStep;
  const themeRef = useRef(theme);
  themeRef.current = theme;

  const writableSize = dataMemoryTable?.directivesWritableSize;
  const readOnlySize = dataMemoryTable?.directivesReadOnlySize;

  // Label addresses. SP derives from the decimal `sp` state; Heap from the
  // directive sizes. `withLabels` recomputes labels from scratch, so moving the
  // SP or resizing the Heap needs no prev-clearing (the old `setSP` dance).
  const spAddress = sp !== "" && !Number.isNaN(parseInt(sp)) ? hexUpper(parseInt(sp)) : undefined;
  const heapAddress = hexUpper((writableSize ?? 0) + (readOnlySize ?? 0));

  const spAddressRef = useRef<string | undefined>(spAddress);
  spAddressRef.current = spAddress;

  const displayRows = useMemo(
    () => withLabels(baseRows, heapAddress, spAddress),
    [baseRows, heapAddress, spAddress]
  );

  const columns = useMemo(
    () => buildMemoryColumns(withBin ? "bin" : "hex", isFirstStepRef),
    [withBin]
  );

  // Options captured once at mount; the row formatter reads live refs. Segment
  // colouring mirrors the old rowFormatter and skips the SP row.
  const options = useMemo(
    () => ({
      index: "address",
      initialSort: [{ column: "address", dir: "desc" as const }],
      rowFormatter: (row: RowComponent) => {
        const data = row.getData() as AvailableRow;
        if (data.address === spAddressRef.current) return;
        const el = row.getElement();
        if (data.segment === "directivesReadOnlySize") {
          el.style.backgroundColor = "#B0B8C4";
          el.style.color = "#000";
        } else if (data.segment === "directivesWritableSize") {
          el.style.backgroundColor = "#C5D9E0";
          el.style.color = "#000";
        } else {
          el.style.backgroundColor = "";
          el.style.color = "";
        }
        // Persist the "written" colour on the last-written bytes. Reapplied on
        // every render, so it survives the declarative setData redraw.
        if (data.writtenFields?.length) {
          const cls = themeRef.current === "light" ? "written-cell" : "written-cell-dark";
          const paint = (target: Element | null) => {
            if (!(target instanceof HTMLElement)) return;
            // Clear both theme variants first so a theme switch reflows cleanly.
            target.classList.remove("written-cell", "written-cell-dark");
            target.classList.add(cls);
          };
          data.writtenFields.forEach((field) => {
            paint(el.querySelector(`div[tabulator-field="${field}"]`));
            // Colour the matching byte pair in the HEX column too.
            paint(el.querySelector(`div[tabulator-field="hex"] .hex-byte[data-hexfield="${field}"]`));
          });
        }
      },
    }),
    []
  );

  // --- Seed rows from the loaded memory (replaces the build-time upload). ---
  useEffect(() => {
    if (!dataMemoryTable) return;
    setBaseRows(buildAvailableRows(dataMemoryTable.memory, writableSize, readOnlySize));
    setSp(String(dataMemoryTable.memory.length - 4));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataMemoryTable]);

  // --- SP tracks writes to x2. ---
  const prevWriteInRegisterRef = useRef(writeInRegister);
  useEffect(() => {
    const prev = prevWriteInRegisterRef.current;
    prevWriteInRegisterRef.current = writeInRegister;
    if (prev === writeInRegister) return;
    if (writeInRegister.value !== "" && writeInRegister.registerName === "x2") {
      const next = String(binaryToInt(writeInRegister.value));
      if (next !== sp) setSp(next);
    }
  }, [writeInRegister, sp, setSp]);

  // --- Resize: recompute the memory array, sync SP + x2, notify the host. ---
  useEffect(() => {
    if (!ready || !dataMemoryTable) return;
    const current: string[] = dataMemoryTable.memory;
    let newMemory: string[];
    if (sizeMemory < current.length) newMemory = current.slice(0, sizeMemory);
    else if (sizeMemory > current.length)
      newMemory = [...current, ...new Array(sizeMemory - current.length).fill("00000000")];
    else newMemory = current;

    setBaseRows(buildAvailableRows(newMemory, writableSize, readOnlySize));
    setSp(hexUpper(sizeMemory - 4));
    setWriteInRegister({ registerName: "x2", value: intTo32BitBinary(sizeMemory - 4) });
    setDataMemoryTable({ ...dataMemoryTable, memory: newMemory });
    sendMessage({ event: "memorySizeChanged", sizeMemory });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sizeMemory]);

  // --- Write: update the word row's bytes, then flash + scroll. ---
  useEffect(() => {
    if (!ready || writeInMemory.value === "") return;
    const { address, _length, value } = writeInMemory;
    const rowStart = address - (address % 4);
    const rowAddr = rowStart.toString(16).toUpperCase();
    setBaseRows((rows) =>
      rows.map((r) =>
        r.address === rowAddr
          ? { ...writeRowBytes(r, _length, value), writtenFields: touchedFields(_length) }
          : r
      )
    );
    // Only the transient pulse here; the persistent "written" colour is owned by
    // the rowFormatter (via writtenFields), so it is not stripped when the pulse
    // ends after 500ms.
    const flashAddr = address.toString(16).toUpperCase();
    handleRef.current?.flashCells(flashAddr, touchedFields(_length), ["animate-cell"]);
    handleRef.current?.scrollToRow(flashAddr);
    setWriteInMemory({ address: 0, _length: 0, value: "" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [writeInMemory]);

  // --- Read: flash (no colour) + scroll, no data change. ---
  useEffect(() => {
    if (!ready || readInMemory.value === "-1") return;
    const flashAddr = readInMemory.address.toString(16).toUpperCase();
    handleRef.current?.flashCells(flashAddr, touchedFields(readInMemory._length), ["animate-cell"]);
    handleRef.current?.scrollToRow(flashAddr);
    setReadInMemory({ address: 0, _length: 0, value: "-1" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [readInMemory]);

  // --- Import: merge imported rows (by address) into the base rows. ---
  useEffect(() => {
    if (!ready || importMemory.length === 0) return;
    const byAddress = new Map(
      importMemory.map((r) => [r.address.toUpperCase(), r] as [string, Partial<AvailableRow>])
    );
    setBaseRows((rows) =>
      rows.map((r) => {
        const imp = byAddress.get(r.address);
        if (!imp) return r;
        const merged = { ...r, ...imp, address: r.address };
        merged.hex = rowHex(merged.value0, merged.value1, merged.value2, merged.value3);
        return merged;
      })
    );
    setImportMemory([]);
    sendWebviewMessage({ event: "memoryChanged", memory: importMemory });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [importMemory]);

  // --- Search: filter rows and reposition the PC icon. ---
  // The toolbar is a permanent part of the table chrome, so search works before
  // the first step too (the old newPc gate only hid the search box). The PC-icon
  // reposition still waits for a real PC (newPc > 0).
  useEffect(() => {
    if (!ready) return;
    if (search.trim() === "") {
      handleRef.current?.clearFilter();
    } else {
      handleRef.current?.setFilter((data) => matchesMemoryQuery(data, search));
    }
    if (newPc > 0) handleRef.current?.markPc((newPc * 4).toString(16).toUpperCase());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, ready]);

  // --- Reflow the written-cell colours when the theme changes. ---
  useEffect(() => {
    if (ready) handleRef.current?.redraw();
  }, [theme, ready]);

  const onEdit = (row: AvailableRow) => {
    const hex = rowHex(row.value0, row.value1, row.value2, row.value3);
    setBaseRows((rows) => rows.map((r) => (r.address === row.address ? { ...r, ...row, hex } : r)));
    sendWebviewMessage({ event: "memoryChanged", memory: displayRows });
  };

  const onReady = (handle: SimulatorTableHandle) => {
    handleRef.current = handle;
    setReady(true);
    setIsCreatedMemoryTable(true);
  };

  return (
    <>
      <div
        className={`shadow-lg !min-h-min max-h-[calc(100dvh-2.3rem)] mx-4 relative ${withBin ? "min-w-[37.36rem]" : "min-w-[16.7rem]"} ${
          !showTable && "hidden"
        }`}>
        <div
          className={`flex h-full w-full flex-col transition-opacity ease-in 9000 ${
            ready ? "opacity-100" : "opacity-0"
          }`}>
          {/* Search toolbar on top of the data-memory table. reserveRightRem
              leaves room for the floating hover-menu icon at top-right. */}
          <TableSearchBand value={search} onChange={setSearch} placeholder="e.g 1234" reserveRightRem={2.5} />
          <SimulatorTable<AvailableRow>
            id="availableMemoryTable"
            className={`w-full min-h-0 flex-1 overflow-x-hidden ${
              theme === "light" ? "theme-light" : "theme-dark"
            }`}
            columns={columns}
            data={displayRows}
            options={options}
            onEdit={(row, cell: CellComponent) => {
              if (cell.getField().startsWith("value")) onEdit(row);
            }}
            onReady={onReady}
          />
          <HoverCard openDelay={200} closeDelay={100}>
            <HoverCardTrigger asChild>
              <Menu
                id="optionsAvailableMemoryTable"
                strokeWidth={1.5}
                className="absolute cursor-pointer right-[0rem] top-[.4rem] min-w-[1.3rem] min-h-[1.3rem] w-[1.3rem] h-[1.3rem] z-100 text-black hover:scale-110 transition-transform"
              />
            </HoverCardTrigger>
            <HoverCardContent
              side="right"
              align="center"
              className="w-auto p-1 ml-2 border rounded-md shadow-lg bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm">
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setWithBin((prev) => !prev)}
                  title="Toggle Binary"
                  className="p-1 transition-colors rounded-md hover:bg-gray-200 dark:hover:bg-zinc-700">
                  <Binary strokeWidth={1.5} className="w-5 h-5 text-black dark:text-white" />
                </button>
                <button
                  onClick={() => setShowTable(false)}
                  title="Hide Table"
                  className="p-1 transition-colors rounded-md hover:bg-gray-200 dark:hover:bg-zinc-700">
                  <ArrowBigLeftDash strokeWidth={1.5} className="w-5 h-5 text-black dark:text-white" />
                </button>
              </div>
            </HoverCardContent>
          </HoverCard>
        </div>
        {!ready && (
          <div className="absolute inset-0">
            <SkeletonMemoryTable />
          </div>
        )}
      </div>
      {!showTable && (
        <div
          onClick={() => setShowTable(true)}
          className={`h-full w-[1.6rem] cursor-pointer rounded-[.2rem] flex flex-col items-center uppercase border hover:opacity-[0.9] transition-all ease-in-out duration-200
    bg-[#E3F2FD] border-gray-700 text-black`}>
          <ArrowBigRightDash
            strokeWidth={1.5}
            className={`mt-[0.35rem] mb-1 min-w-[.9rem] min-h-[.9rem] w-[.9rem] h-[.9rem]`}
          />
          {"memory".split("").map((char, index) => (
            <span key={index} className={`text-[.45rem] font-bold leading-[.91rem]`}>
              {char === " " ? " " : char}
            </span>
          ))}
        </div>
      )}
    </>
  );
};

export default AvailableMemory;
