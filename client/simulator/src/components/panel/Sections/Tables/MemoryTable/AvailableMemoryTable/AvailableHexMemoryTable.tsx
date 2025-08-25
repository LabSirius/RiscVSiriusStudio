import { useRef, useState } from "react";
import { useMemoryTable } from "@/context/shared/MemoryTableContext";
import { useRegistersTable } from "@/context/panel/RegisterTableContext";
import { useSimulator } from "@/context/shared/SimulatorContext";
import { TabulatorFull as Tabulator } from "tabulator-tables";
import "../../tabulator.css";

import { useTheme } from "@/components/ui/theme/theme-provider";

import SkeletonMemoryTable from "@/components/panel/Skeleton/SkeletonMemoryTable";
import { useLines } from "@/context/panel/LinesContext";
import { ArrowBigLeftDash, ArrowBigRightDash, Binary } from "lucide-react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

import { UseHexAvMemoryTabulator } from "@/hooks/text/memory/availableMemory/UseHexAvMemoryTabulator";
import { useMemoryResizeEffect } from "@/hooks/text/memory/availableMemory/useMemoryResizeEffect";
import { useMemoryImportEffect } from "@/hooks/text/memory/availableMemory/useMemoryImportEffect";
import { useSyncIsFirstStepRef } from "@/hooks/text/memory/shared/useSyncIsFirstStepRef";
import { useStackPointerEffect } from "@/hooks/text/memory/availableMemory/useStackPointerEffect";
import { useMemoryCellWriteEffect } from "@/hooks/text/memory/availableMemory/useMemoryCellWriteEffect";
import { useAnimateMemoryRead } from "@/hooks/text/memory/availableMemory/useAnimateMemoryRead";
import { useMemorySearchFilterEffect } from "@/hooks/text/memory/shared/useMemorySearchFilterEffect";

interface AvailableMemoryTable {
  withBin: boolean;
  setWithBin: React.Dispatch<React.SetStateAction<boolean>>;
}

const AvailableHexMemoryTable = ({setWithBin, withBin}: AvailableMemoryTable ) => {
  console.log(withBin,setWithBin)

  const { theme } = useTheme();
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const tableInstanceRef = useRef<Tabulator | null>(null);

  const {
    isCreatedMemoryTable,
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
    searchInMemory
  } = useMemoryTable();

  const { newPc, setNewPc, isFirstStep } = useSimulator();
  const newPcRef = useRef(newPc);

  const { writeInRegister, setWriteInRegister } = useRegistersTable();
  const { setClickAddressInMemoryTable } = useLines();
  const isFirstStepRef = useRef(isFirstStep);

  const [showTable, setShowTable] = useState(true);

  UseHexAvMemoryTabulator({
    tableContainerRef,
    tableInstanceRef,
    isCreatedMemoryTable,
    setIsCreatedMemoryTable,
    dataMemoryTable,
    newPcRef,
    isFirstStepRef,
    setSp,
    setNewPc,
    setClickAddressInMemoryTable,
  });

  useMemoryResizeEffect({
    isCreatedMemoryTable,
    tableInstanceRef,
    dataMemoryTable,
    setDataMemoryTable,
    sizeMemory,
    setNewPc,
    setSp,
    setWriteInRegister,
  });

  useMemorySearchFilterEffect({
    tableInstanceRef,
    isCreatedMemoryTable,
    newPc,
    searchInMemory,
  });

  useMemoryImportEffect({
    isCreatedMemoryTable,
    tableInstanceRef,
    importMemory,
    setImportMemory,
  });

  useSyncIsFirstStepRef({
    isCreatedMemoryTable,
    isFirstStep,
    isFirstStepRef,
  });

  useStackPointerEffect({
    tableInstanceRef,
    isCreatedMemoryTable,
    writeInRegister,
    sp,
    setSp,
  });

  useMemoryCellWriteEffect({
    isCreatedMemoryTable,
    tableInstanceRef,
    theme,
    writeInMemory,
    setWriteInMemory,
  });

  useAnimateMemoryRead({
    isCreatedMemoryTable,
    tableInstanceRef,
    readInMemory,
    setReadInMemory,
  });

  return (
    <>
      <div className={`shadow-lg !min-h-min min-w-[16.7rem] mx-4 relative ${(!showTable || withBin)&& "hidden"}`}>
        <div
          className={`h-full w-full transition-opacity ease-in 9000 ${
            isCreatedMemoryTable ? "opacity-100" : "opacity-0"
          }`}>
          <div
            ref={tableContainerRef}
            className={`w-full h-full overflow-x-hidden ${
              theme === "light" ? "theme-light" : "theme-dark"
            }`}
          />
          
          <HoverCard openDelay={200} closeDelay={100}>
            <HoverCardTrigger asChild>
              <ArrowBigLeftDash
                onClick={() => setShowTable(false)}
                strokeWidth={1.5}
                className="absolute cursor-pointer right-[0rem] top-[.4rem] min-w-[1.3rem] min-h-[1.3rem] w-[1.3rem] h-[1.3rem] z-100 text-black hover:scale-110 transition-transform"
              />
            </HoverCardTrigger>
            <HoverCardContent side="right" align="center" className="w-auto p-1 border rounded-md shadow-lg ml-2 bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm">
              <button
                onClick={() => setWithBin(prev => !prev)}
                title="Toggle Binary"
                className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
              >
                <Binary strokeWidth={1.5} className="w-5 h-5 text-black dark:text-white" />
              </button>
            </HoverCardContent>
          </HoverCard>

        </div>
        {!isCreatedMemoryTable && (
          <div className="absolute inset-0">
            <SkeletonMemoryTable />
          </div>
        )}
      </div>
      {!showTable && withBin && (
        <div
          onClick={() => setShowTable(true)}
          className={`h-full w-[1.6rem] cursor-pointer rounded-[.2rem] flex flex-col items-center uppercase border hover:opacity-[0.9] transition-all ease-in-out duration-200
    bg-[#E3F2FD] border-gray-700 text-black`}>
          <ArrowBigRightDash
            strokeWidth={1.5}
            className={`mt-[0.35rem] mb-1 min-w-[.9rem] min-h-[.9rem] w-[.9rem] h-[.9rem]`}
          />
          {"memory".split("").map((char, index) => (
            <span
              key={index}
              className={`text-[.45rem] font-bold leading-[.91rem]`}>
              {char === " " ? "\u00A0" : char}
            </span>
          ))}
        </div>
      )}
    </>
  );
};

export default AvailableHexMemoryTable;