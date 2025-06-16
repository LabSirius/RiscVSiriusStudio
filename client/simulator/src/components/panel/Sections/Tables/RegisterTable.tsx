import { useEffect, useRef, useState, useMemo } from "react";
import { TabulatorFull as Tabulator, CellComponent } from "tabulator-tables";
import "./tabulator.css";

import { useMemoryTable } from "@/context/panel/MemoryTableContext";
import { useRegistersTable } from "@/context/panel/RegisterTableContext";
import { useSimulator } from "@/context/shared/SimulatorContext";
import { useTheme } from "@/components/panel/ui/theme/theme-provider";

import { getColumnsRegisterDefinitions } from "@/utils/tables/definitions/definitionsColumns";

import { registersNames } from "@/components/panel/Sections/constants/data";
import { RegisterView } from "@/utils/tables/types";

import {
  createViewTypeFormatter,
  handleGlobalKeyPress,
  updateRegisterValue,
  filterTableData,
} from "@/utils/tables/handlersRegisters";
import { resetCellColors } from "@/utils/tables/handlersShared";

import SkeletonRegisterTable from "@/components/panel/Skeleton/SkeletonRegisterTable";
import { sendMessage } from "@/components/Message/sendMessage";
import { useRegisterData } from "@/context/shared/RegisterData";
import { ArrowBigLeftDash, ArrowBigRightDash } from "lucide-react";

const RegistersTable = () => {
  const { theme } = useTheme();
  const { isCreatedMemoryTable } = useMemoryTable();
  const { registerData, setRegisterData } = useRegisterData();
  const {
    writeInRegister,
    setWriteInRegister,
    importRegister,
    setImportRegister,
    searchInRegisters,
    checkFixedRegisters,
    fixedchangedRegisters,
    setFixedchangedRegisters,
  } = useRegistersTable();
  const [showTable, setShowTable] = useState(true);

  const tableContainerRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  const tabulatorInstance = useRef<Tabulator | null>(null);

  const currentHoveredViewTypeCell = useRef<CellComponent | null>(null);
  const [tableBuilt, setTableBuilt] = useState(false);

  const { isFirstStep } = useSimulator();

  const viewTypeFormatterCustom = useMemo(
    () =>
      createViewTypeFormatter((cell) => {
        currentHoveredViewTypeCell.current = cell;
      }),
    []
  );

  //Reset the registerData when the memory table is created (for 2 or more simulations)
  useEffect(() => {
    if (!isCreatedMemoryTable) {
      setFixedchangedRegisters([]);
      setRegisterData(Array(32).fill("0".repeat(32)));
    }
  }, [isCreatedMemoryTable]);

  // --- GLOBAL KEYBOARD SHORTCUTS ---
  useEffect(() => {
    if (!tableBuilt) return;
    const keyHandler = handleGlobalKeyPress(currentHoveredViewTypeCell);
    document.addEventListener("keydown", keyHandler);
    return () => document.removeEventListener("keydown", keyHandler);
  }, [tableBuilt]);

  // --- TABULATOR INITIALIZATION (se ejecuta solo una vez) ---
  useEffect(() => {
    if (!tableRef.current || tabulatorInstance.current) return;

    // Initial data
    const initialData = registersNames.map((name, id) => ({
      name,
      rawName: name.split(" ")[0],
      value: registerData[id],
      viewType: (name.split(" ")[0] === "x2" ? 16 : 2) as RegisterView,
      watched: false,
      modified: 0,
      id,
    }));

    tabulatorInstance.current = new Tabulator(tableRef.current, {
      data: initialData,
      columns: getColumnsRegisterDefinitions(viewTypeFormatterCustom, isFirstStep, theme),
      layout: "fitColumns",
      renderVertical: "virtual",
      reactiveData: true,
      groupBy: "watched",
      groupValues: [[true, false]],
      groupHeader: (value, count) => `${value ? "Watched" : "Unwatched"} (${count} registers)`,
      movableRows: true,
      index: "rawName",
    });

    tabulatorInstance.current.on("tableBuilt", () => {
      setTableBuilt(true);
    });

    tabulatorInstance.current.on("cellEdited", (cell) => {
      if (cell.getField() === "value") {
        let { value } = cell.getData();
        const { id } = cell.getData();
        if (value.length < 32) {
          value = value.padStart(32, "0");
        }
        setRegisterData((prevData) => {
          const newData = [...prevData];
          newData[id] = value;
          sendMessage({ event: "registersChanged", registers: newData });
          return newData;
        });
      }
    });

    return () => {
      if (tabulatorInstance.current) {
        tabulatorInstance.current.destroy();
        tabulatorInstance.current = null;
        setTableBuilt(false);
      }
    };
  }, [isCreatedMemoryTable]);

  /*
   * This useEffect updates the value of a register when the user writes a new value and if checkFixedRegisters is true, updates the watched property of the register.
   */
  useEffect(() => {
    if (writeInRegister.value === "" || writeInRegister.registerName === "x0" || !tableBuilt)
      return;

    const index = Number(writeInRegister.registerName.replace("x", ""));
    setRegisterData((prevData) => {
      const newRegisters = [...prevData];
      newRegisters[index] = writeInRegister.value;
      return newRegisters;
    });
    updateRegisterValue(tabulatorInstance, writeInRegister.registerName, writeInRegister.value);

    if (checkFixedRegisters) {
      const row = tabulatorInstance.current?.getRow(writeInRegister.registerName);
      if (row) {
        const rowData = row.getData();
        if (!rowData.watched) {
          row.update({ ...rowData, watched: true });
          tabulatorInstance.current?.setGroupBy("watched");
        }
      }
    }
    setFixedchangedRegisters((prev) => [...prev, writeInRegister.registerName]);
    setWriteInRegister({ registerName: "", value: "" });
  }, [
    writeInRegister,
    setWriteInRegister,
    tableBuilt,
    setFixedchangedRegisters,
    checkFixedRegisters,
    setRegisterData,
  ]);

  useEffect(() => {
    if (!tableBuilt || !checkFixedRegisters) return;

    tabulatorInstance.current?.getRows().forEach((row) => {
      const rowData = row.getData();

      if (fixedchangedRegisters.includes(rowData.rawName) && !rowData.watched) {
        row.update({ ...rowData, watched: true });
      }
    });

    tabulatorInstance.current?.setGroupBy("watched");
  }, [checkFixedRegisters, tableBuilt, fixedchangedRegisters]);

  // This useEffect updates the table when the importRegister state changes
  useEffect(() => {
    if (!tableBuilt || importRegister.length === 0) return;
    tabulatorInstance.current?.setData(importRegister);
    setImportRegister([]);
  }, [importRegister, setImportRegister, tableBuilt]);

  // This useEffect disable editor in the first step
  useEffect(() => {
    if (tabulatorInstance.current) {
      tabulatorInstance.current.setColumns(
        getColumnsRegisterDefinitions(viewTypeFormatterCustom, isFirstStep, theme)
      );
    }
  }, [isFirstStep]);

  // This useEffect filters the table when the searchInRegisters state changes
  useEffect(() => {
    if (!tabulatorInstance.current || !tableBuilt) return;
    if (searchInRegisters.trim() === "") {
      tabulatorInstance.current.clearFilter(true);
      resetCellColors(tabulatorInstance.current);
    } else {
      filterTableData(searchInRegisters, tabulatorInstance.current, theme);
    }
  }, [searchInRegisters, tableBuilt]);

  useEffect(() => {
    return () => {
      tabulatorInstance.current?.destroy();
      tabulatorInstance.current = null;
      setTableBuilt(false);
    };
  }, []);

  return (
    <>
      <div
        ref={tableContainerRef}
        className={`shadow-lg min-h-min max-h-[calc(100dvh-2.3rem)] ${
          !showTable && "hidden"
        } min-w-[22.7rem] relative `}>
        {!tableBuilt && <SkeletonRegisterTable />}
        {isCreatedMemoryTable && (
          <>
            <div
              ref={tableRef}
              className={`w-full  h-full ${theme === "light" ? "theme-light" : "theme-dark"}`}
            />
            <ArrowBigLeftDash
              onClick={() => setShowTable(false)}
              size={18}
              strokeWidth={1.5}
              className="absolute right-[.13rem] top-[.4rem] text-black cursor-pointer"
            />
          </>
        )}
      </div>
      {!showTable && (
        <div
          onClick={() => setShowTable(true)}
          className="h-full w-[1.6rem] cursor-pointer  bg-[#2E2E2E] rounded-[.3rem] flex flex-col items-center uppercase">
          <ArrowBigRightDash size={18} strokeWidth={1.5} className="text-gray-400  mt-[0.35rem] mb-3" />
          {"registers".split("").map((char, index) => (
            <span key={index} className="text-[.65rem] text-gray-500 leading-[1.15rem]">
              {char === " " ? "\u00A0" : char}
            </span>
          ))}
        </div>
      )}
    </>
  );
};

export default RegistersTable;
