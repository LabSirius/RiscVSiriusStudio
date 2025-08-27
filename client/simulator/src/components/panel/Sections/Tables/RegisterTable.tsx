import { useRef, useState, useMemo } from "react";
import { TabulatorFull as Tabulator, CellComponent } from "tabulator-tables";
import "./tabulator.css";

import { useMemoryTable } from "@/context/shared/MemoryTableContext";
import { useRegistersTable } from "@/context/panel/RegisterTableContext";
import { useSimulator } from "@/context/shared/SimulatorContext";
import { useTheme } from "@/components/ui/theme/theme-provider";

import { createViewTypeFormatter } from "@/utils/tables/handlersRegisters";

import SkeletonRegisterTable from "@/components/panel/Skeleton/SkeletonRegisterTable";
import { useRegisterData } from "@/context/shared/RegisterData";
import { ArrowBigLeftDash, ArrowBigRightDash } from "lucide-react";

// Hooks
import { useResetRegistersOnNewSimulation } from "@/hooks/text/registers/UseResetRegistersOnNewSimulationProps";
import { useGlobalKeyboardShortcuts } from "@/hooks/text/registers/useGlobalKeyboardShortcuts";
import { useTabulator } from "@/hooks/text/registers/useTabulator";
import { useRegisterUpdates } from "@/hooks/text/registers/useRegisterUpdates";
import { useImportRegisterData } from "@/hooks/text/registers/useImportRegisterData";
import { useUpdateTableColumns } from "@/hooks/text/registers/useUpdateTableColumns";
import { useTableFilter } from "@/hooks/text/registers/useTableFilter";
import { useCustomOptionSimulate } from "@/context/shared/CustomOptionSimulate";

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
  } = useRegistersTable();

  const { checkFixedRegisters, fixedchangedRegisters, setFixedchangedRegisters } =
    useCustomOptionSimulate();
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

  useResetRegistersOnNewSimulation({
    isCreatedMemoryTable,
    setRegisterData,
    setFixedchangedRegisters,
  });

  useGlobalKeyboardShortcuts({
    isTableBuilt: tableBuilt,
    hoveredCellRef: currentHoveredViewTypeCell,
  });

  useTabulator({
    tableRef,
    tabulatorInstance,
    isCreatedMemoryTable,
    registerData,
    setRegisterData,
    viewTypeFormatterCustom,
    isFirstStep,
    theme,
    setTableBuilt,
  });

  useRegisterUpdates({
    tabulatorInstance,
    isTableBuilt: tableBuilt,
    writeInRegister,
    setWriteInRegister,
    setRegisterData,
    checkFixedRegisters,
    fixedchangedRegisters,
    setFixedchangedRegisters,
  });

  useImportRegisterData({
    tabulatorInstance,
    isTableBuilt: tableBuilt,
    importRegister,
    setImportRegister,
  });

  useUpdateTableColumns({
    tabulatorInstance,
    isFirstStep,
    theme,
    viewTypeFormatterCustom,
  });

  useTableFilter({
    tabulatorInstance,
    isTableBuilt: tableBuilt,
    searchInRegisters,
    theme,
  });

  return (
    <>
      <div
        ref={tableContainerRef}
        id="registerTable"
        className={`shadow-lg min-h-min max-h-[calc(100dvh-2.3rem)] mx-4 ${
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
            id="closeRT"
              onClick={() => setShowTable(false)}
              strokeWidth={1.5}
              className="absolute right-[.13rem] top-[.4rem] min-w-[1.3rem] min-h-[1.3rem] w-[1.3rem] h-[1.3rem] text-black cursor-pointer"
            />
          </>
        )}
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
              {char === " " ? "\u00A0" : char}
            </span>
          ))}
        </div>
      )}
    </>
  );
};

export default RegistersTable;
