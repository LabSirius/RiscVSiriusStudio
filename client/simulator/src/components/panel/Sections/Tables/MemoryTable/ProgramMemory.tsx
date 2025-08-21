import { useRef, useState } from "react";
import { useMemoryTable } from "@/context/shared/MemoryTableContext";
import { useSimulator } from "@/context/shared/SimulatorContext";
import { TabulatorFull as Tabulator } from "tabulator-tables";
import "../tabulator.css";

import { useTheme } from "@/components/ui/theme/theme-provider";

import SkeletonMemoryTable from "@/components/panel/Skeleton/SkeletonMemoryTable";
import { useLines } from "@/context/panel/LinesContext";
import { ArrowBigLeftDash, ArrowBigRightDash } from "lucide-react";

//Hooks
import { useMemoryTabulator } from "@/hooks/text/memory/programMemory/useMemoryTabulator";
import { useSyncIsFirstStepRef } from "@/hooks/text/memory/shared/useSyncIsFirstStepRef";
import { useProgramCounterEffect } from "@/hooks/text/memory/programMemory/useProgramCounterEffect";
import { useMemorySearchFilterEffect } from "@/hooks/text/memory/shared/useMemorySearchFilterEffect";
import { useLocatePcEffect } from "@/hooks/text/memory/programMemory/useLocatePcEffect";
import { useEditorClickAnimation } from "@/hooks/text/memory/programMemory/useEditorClickAnimation";

const ProgramMemoryTable = () => {
  const { theme } = useTheme();
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const tableInstanceRef = useRef<Tabulator | null>(null);

  const {
    isCreatedMemoryTable,
    setIsCreatedMemoryTable,
    dataMemoryTable,

    setSp,
    searchInMemory,
    locatePc,
    setLocatePc,

  } = useMemoryTable();

  const { newPc, setNewPc, isFirstStep } = useSimulator();
  const newPcRef = useRef(newPc);

  const { clickInEditorLine, setClickInEditorLine, setClickAddressInMemoryTable } = useLines();
  const isFirstStepRef = useRef(isFirstStep);

  const [showTable, setShowTable] = useState(false);


  useMemoryTabulator({
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


  useSyncIsFirstStepRef({
    isCreatedMemoryTable,
    isFirstStep,
    isFirstStepRef,
  });

  useProgramCounterEffect({
    isCreatedMemoryTable,
    dataMemoryTable,
    newPc,
    newPcRef,
    tableInstanceRef,
  });

  useMemorySearchFilterEffect({
    tableInstanceRef,
    isCreatedMemoryTable,
    newPc,
    searchInMemory,
  });


  useLocatePcEffect({
    isCreatedMemoryTable,
    tableInstanceRef,
    locatePc,
    setLocatePc,
    newPc,
  });

  useEditorClickAnimation({
    isCreatedMemoryTable,
    tableInstanceRef,
    clickInEditorLine,
    setClickInEditorLine,
    dataMemoryTable,
  });
return (
    <>
      <div className={`shadow-lg !min-h-min min-w-[37.36rem]  mx-4  relative ${!showTable && "hidden"}`}>
        <div
          className={`h-full  w-full transition-opacity ease-in 9000  ${
            isCreatedMemoryTable ? "opacity-100" : "opacity-0"
          }`}>
          <div
            ref={tableContainerRef}
            className={`w-full h-full overflow-x-hidden ${
              theme === "light" ? "theme-light" : "theme-dark"
            }`}
          />
          <ArrowBigLeftDash
            onClick={() => {
              setShowTable(false);
            }}
           
            strokeWidth={1.5}
            className="absolute cursor-pointer right-[0rem] top-[.4rem] min-w-[1.3rem] min-h-[1.3rem] w-[1.3rem] h-[1.3rem] z-100 text-black"
          />
        </div>
        {!isCreatedMemoryTable && (
          <div className="absolute inset-0">
            <SkeletonMemoryTable />
          </div>
        )}
      </div>
      {!showTable && (
        <div
          onClick={() => setShowTable(true)}
          className={`h-full w-[1.6rem] cursor-pointer z-100 rounded-[.2rem] flex flex-col items-center uppercase group border 
    ${theme === "light" ? "bg-white border-gray-300" : "bg-[#1a1a1a] border-gray-700"}`}>
          <ArrowBigRightDash
 
            strokeWidth={1.5}
            className={`mt-[0.35rem] mb-3 transition ease-in-out  min-w-[1.3rem] min-h-[1.3rem] w-[1.3rem] h-[1.3rem]
      ${
        theme === "light"
          ? "text-gray-700 group-hover:text-gray-800"
          : "text-gray-400 group-hover:text-gray-300"
      }`}
          />

          {"progmem".split("").map((char, index) => (
            <span
              key={index}
              className={`text-[.55rem] font-bold leading-[1.15rem] transition ease-in-out 
        ${
          theme === "light"
            ? "text-gray-700 group-hover:text-gray-800"
            : "text-gray-400 group-hover:text-gray-500"
        }`}>
              {char === " " ? "\u00A0" : char}
            </span>
          ))}
        </div>
      )}
    </>
  );
};

export default ProgramMemoryTable;
