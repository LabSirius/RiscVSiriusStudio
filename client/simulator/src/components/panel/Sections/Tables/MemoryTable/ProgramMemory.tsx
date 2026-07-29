import { useEffect, useMemo, useRef, useState } from "react";
import { CellComponent, ColumnDefinition, RowComponent } from "tabulator-tables";
import "../tabulator.css";

import { useMemoryTable } from "@/context/shared/MemoryTableContext";
import { useSimulator } from "@/context/shared/SimulatorContext";
import { useLines } from "@/context/panel/LinesContext";
import { useTheme } from "@/components/ui/theme/theme-provider";

import SkeletonMemoryTable from "@/components/panel/Skeleton/SkeletonMemoryTable";
import { ArrowBigLeftDash, ArrowBigRightDash } from "lucide-react";

import { SimulatorTable, SimulatorTableHandle } from "../SimulatorTable";
import { buildMemoryColumns } from "@/utils/tables/definitions/memoryColumns";
import { buildProgramRows, ProgramRow } from "@/utils/tables/programRows";
import { hexToInt, binaryToIntTwoComplement } from "@/utils/handlerConversions";
import { createPCIcon } from "@/utils/tables/handlersMemory";
import { sendMessage } from "@/components/Message/sendMessage";

/**
 * The single program-memory table — one adapter of SimulatorTable (ADR-0006).
 * Replaces the six imperative Tabulator hooks (build, PC-icon, locate, editor
 * click, search, isFirstStep sync). The instruction rows are a declarative,
 * memoized array (`buildProgramRows`); the PC icon, editor-click jump arrow,
 * instruction tooltips, and search all go through the SimulatorTable handle.
 * Program memory is read-only, so there is no write path.
 */
const ProgramMemoryTable = () => {
  const { theme } = useTheme();
  const {
    setIsCreatedMemoryTable,
    dataMemoryTable,
    typesInstruction,
    searchInMemory,
    locatePc,
    setLocatePc,
    showProgramTable,
    setShowProgramTable,
  } = useMemoryTable();

  const { newPc, setNewPc, isFirstStep } = useSimulator();
  const { clickInEditorLine, setClickInEditorLine, setClickAddressInMemoryTable } = useLines();

  const [ready, setReady] = useState(false);

  const handleRef = useRef<SimulatorTableHandle | null>(null);
  // Live refs so the mount-once column `cellClick` and the effects read fresh
  // values without rebuilding columns or re-creating the table.
  const isFirstStepRef = useRef(isFirstStep);
  isFirstStepRef.current = isFirstStep;
  const newPcRef = useRef(newPc);
  newPcRef.current = newPc;
  const dataMemoryTableRef = useRef(dataMemoryTable);
  dataMemoryTableRef.current = dataMemoryTable;

  const displayRows = useMemo<ProgramRow[]>(
    () =>
      dataMemoryTable
        ? buildProgramRows(dataMemoryTable.program, dataMemoryTable.symbols, typesInstruction)
        : [],
    [dataMemoryTable, typesInstruction]
  );

  // Columns built once. The address column gains a `cellClick`: select the line
  // in the editor, notify the host, and — if the instruction jumps — draw the
  // jump arrow through the handle. Reads live refs, so the closure never staffs.
  const columns = useMemo<ColumnDefinition[]>(() => {
    const cols = buildMemoryColumns("program", isFirstStepRef);
    return cols.map((col) =>
      col.field === "address"
        ? {
            ...col,
            cellClick: (_e: UIEvent, cell: CellComponent) => {
              const data = dataMemoryTableRef.current;
              if (!data) return;
              const address = cell.getValue() as string;
              const intAddress = Number(hexToInt(address)) / 4;
              const instruction = data.addressLine[intAddress];
              if (!instruction) return;
              setClickAddressInMemoryTable(instruction.line);
              sendMessage({ event: "clickInInstruction", line: instruction.line });
              if (instruction.jump) {
                const intJump = Number(binaryToIntTwoComplement(String(instruction.jump)));
                handleRef.current?.animateArrow(intAddress * 4, intJump + intAddress * 4);
              }
            },
          }
        : col
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // The PC icon is *persistent* DOM (it must survive a `setData` and a
  // virtual-scroll row recycle), so it lives in the rowFormatter, which re-runs
  // on every build/redraw/recycle — not in a one-shot handle call (ADR-0006
  // gotcha #1). The formatter reads the live `newPcRef`, so moving the PC is a
  // `redraw()`, and it repaints correctly the moment the rows first arrive.
  const options = useMemo(
    () => ({
      index: "address",
      initialSort: [{ column: "address", dir: "desc" as const }],
      rowFormatter: (row: RowComponent) => {
        const cell = row.getCell("address");
        if (!cell) return;
        const cellEl = cell.getElement();
        cellEl.querySelectorAll(".pc-icon").forEach((n) => n.remove());
        const data = row.getData() as ProgramRow;
        if (data.address === (newPcRef.current * 4).toString(16).toUpperCase()) {
          cellEl.style.position = "relative";
          cellEl.appendChild(createPCIcon());
        }
      },
    }),
    []
  );

  // --- Move the PC icon to the current row and pulse it (replaces
  // useProgramCounterEffect). `redraw` re-runs the rowFormatter, which owns the
  // icon; `flashCells` adds only the transient 300ms pulse. ---
  useEffect(() => {
    if (!ready) return;
    handleRef.current?.redraw();
    handleRef.current?.flashCells((newPc * 4).toString(16).toUpperCase(), ["address"], ["animate-pc"], 300);
  }, [newPc, ready]);

  // --- Locate: scroll the current PC row to the top (replaces useLocatePcEffect). ---
  useEffect(() => {
    if (!ready || !locatePc) return;
    handleRef.current?.scrollToRow((newPcRef.current * 4).toString(16).toUpperCase(), "top");
    setLocatePc(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locatePc, ready]);

  // --- Editor click: pulse the mapped row and draw its jump arrow. ---
  useEffect(() => {
    if (!ready || clickInEditorLine === -1) return;
    const data = dataMemoryTableRef.current;
    const position = data?.addressLine.findIndex((item) => item.line === clickInEditorLine) ?? -1;
    if (position !== -1 && data) {
      handleRef.current?.animateRow(position * 4);
      const jump = data.addressLine[position].jump;
      if (jump) {
        const intJump = Number(binaryToIntTwoComplement(String(jump)));
        handleRef.current?.animateArrow(position * 4, intJump + position * 4);
      }
    }
    setClickInEditorLine(-1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clickInEditorLine, ready]);

  // --- Search: filter rows and reposition the PC icon. Gated until the program
  // has stepped once (newPc > 0), mirroring the original. NOTE (deferred polish):
  // `searchInMemory` is shared, so this still filters the available-memory table
  // at the same time — program search scope is logged for a later split. ---
  useEffect(() => {
    if (!ready || newPcRef.current === 0) return;
    const q = searchInMemory.trim().toLowerCase();
    if (q === "") {
      handleRef.current?.clearFilter();
    } else {
      const fields = ["address", "value3", "value2", "value1", "value0", "hex"];
      handleRef.current?.setFilter((data) =>
        fields.some((f) => String(data[f] ?? "").toLowerCase().includes(q))
      );
    }
    // The PC icon repositions itself: setFilter/clearFilter trigger a redraw,
    // which re-runs the rowFormatter that owns the icon.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInMemory, ready]);

  const onReady = (handle: SimulatorTableHandle) => {
    handleRef.current = handle;
    handle.setupTooltips();
    setReady(true);
    setIsCreatedMemoryTable(true);
    // Reset the PC to the program entry once the table exists (was the
    // uploadProgramMemory onComplete callback).
    setNewPc(0);
  };

  return (
    <>
      <div
        className={`shadow-lg !min-h-min min-w-[37.96rem]  mx-4  relative ${
          !showProgramTable && "hidden"
        }`}>
        <div
          className={`h-full  w-full transition-opacity ease-in 9000  ${
            ready ? "opacity-100" : "opacity-0"
          }`}>
          <SimulatorTable<ProgramRow>
            id="programTable"
            className={`w-full h-full overflow-x-hidden ${
              theme === "light" ? "theme-light" : "theme-dark"
            }`}
            columns={columns}
            data={displayRows}
            options={options}
            onReady={onReady}
          />
          <ArrowBigLeftDash
            onClick={() => {
              setShowProgramTable(false);
            }}
            strokeWidth={1.5}
            className="absolute cursor-pointer right-[0rem] top-[.4rem] min-w-[1.3rem] min-h-[1.3rem] w-[1.3rem] h-[1.3rem] z-100 text-black"
          />
        </div>
        {!ready && (
          <div className="absolute inset-0">
            <SkeletonMemoryTable />
          </div>
        )}
      </div>
      {!showProgramTable && (
        <div
          onClick={() => setShowProgramTable(true)}
          className={`h-full w-[1.6rem] cursor-pointer  rounded-[.2rem] flex flex-col items-center uppercase group border hover:opacity-[0.9] transition-all ease-in-out duration-200
    bg-[#E3F2FD] border-gray-700 text-black`}>
          <ArrowBigRightDash
            strokeWidth={1.5}
            className={`mt-[0.35rem] mb-1   min-w-[.9rem] min-h-[.9rem] w-[.9rem] h-[.9rem]
      `}
          />

          {"program memory".split("").map((char, index) =>
            char === " " ? (
              <div key={index} className="h-2" />
            ) : (
              <span
                key={index}
                className={`text-[.45rem] font-bold leading-[.91rem]
        `}>
                {char}
              </span>
            )
          )}
        </div>
      )}
    </>
  );
};

export default ProgramMemoryTable;
