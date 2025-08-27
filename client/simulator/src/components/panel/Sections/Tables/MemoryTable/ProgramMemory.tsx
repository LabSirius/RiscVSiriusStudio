import { useRef } from "react";
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
    showProgramTable, setShowProgramTable
  } = useMemoryTable();

  const { newPc, setNewPc, isFirstStep } = useSimulator();
  const newPcRef = useRef(newPc);

  const { clickInEditorLine, setClickInEditorLine, setClickAddressInMemoryTable } = useLines();
  const isFirstStepRef = useRef(isFirstStep);


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
    <div id="programTable">
      <div
        className={`shadow-lg !min-h-min min-w-[37.36rem]  mx-4  relative ${
          !showProgramTable && "hidden"
        }`}>
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
              setShowProgramTable(false);
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
    </div>
  );
};

export default ProgramMemoryTable;
