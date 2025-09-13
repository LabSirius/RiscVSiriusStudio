import { useRef, useState } from "react";
import { TabulatorFull as Tabulator } from "tabulator-tables";
import "./tabulator.css";
import { useTheme } from "@/components/ui/theme/theme-provider";
import { ArrowBigLeftDash, ArrowBigRightDash } from "lucide-react";
import { useCurrentInst } from "@/context/graphic/CurrentInstContext";

import { useInitializePipelineTable } from "@/hooks/graphic/useTabulator";
import { useUpdatePipelineTable } from "@/hooks/graphic/useUpdatePipelineTable";

const StagesPipeline = () => {
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const tabulatorInstance = useRef<Tabulator | null>(null);
  const rowCounterRef = useRef<number>(0);

  const [showTable, setShowTable] = useState(false);
  const { pipelineValuesStages } = useCurrentInst();
  const { theme } = useTheme();

  useInitializePipelineTable({
    tableContainerRef,
    tabulatorInstance,
  });

  useUpdatePipelineTable({
    tabulatorInstance,
    pipelineValuesStages,
    rowCounterRef,
  });

  return (
    <>
      <div
        className={`shadow-lg !min-h-min min-w-[51.36rem]  mx-4  relative ${
          !showTable && "hidden"
        }`}>
        <div className={`h-full  w-full transition-opacity ease-in 9000`}>
          <div
            id="pipelineTable"
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
      </div>
      {!showTable && (
        <div
          onClick={() => setShowTable(true)}
          className={`h-full w-[1.6rem] cursor-pointer  rounded-[.2rem] flex flex-col items-center uppercase group border hover:opacity-[0.9] transition-all ease-in-out duration-200
   bg-[linear-gradient(to_bottom,_#fde2e2_0%,_#fef9c3_26%,_#e0f2fe_46%,_#dcfce7_66%,_#ffedd5_86%,_#ffedd5_100%)] border-gray-700 text-black`}>
          <ArrowBigRightDash
            strokeWidth={1.5}
            className={`mt-[0.35rem] mb-1   min-w-[.9rem] min-h-[.9rem] w-[.9rem] h-[.9rem]
      `}
          />
          {"stages".split("").map((char, index) =>
            char === " " ? (
              <div key={index} className="h-2" />
            ) : (
              <span key={index} className={`text-[.45rem] font-bold leading-[.91rem]`}>
                {char}
              </span>
            )
          )}
        </div>
      )}
    </>
  );
};

export default StagesPipeline;
