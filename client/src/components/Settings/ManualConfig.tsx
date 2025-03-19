import { Button } from "@/components/ui/button";
import { RedoDot, FileDown, Save, Grid2x2Plus } from "lucide-react";

const ManualConfig = () => {
  return (
    <div className="flex flex-col gap-7 ">
      <p className="flex text-md text-gray-400">
        Press
        <span className="inline text-slate-400 mx-2">
            <RedoDot strokeWidth={1} />
        </span>{" "}
        to execute the first instruction
        </p>

      <div className="flex flex-col gap-2 mt-1">
        <p className=" ">Import data</p>

        <div className="flex gap-3 mt-2 items-center">
          <div className="flex gap-2 items-center">
            <input type="file" id="fileInputImportRegister" accept=".txt" className="hidden" />

            <div className="flex gap-2 items-center">
              <Button variant="outline" size="icon" id="importRegisterBtn">
                <FileDown strokeWidth={1} />
              </Button>
              <p className="text-gray">Registers</p>
            </div>
          </div>

          <div className="flex gap-2 items-center ml-4">
            <input type="file" id="fileInputImportMemory" accept=".txt" className="hidden" />
            <div className="flex gap-2 items-center">
              <Button variant="outline" size="icon" id="importMemoryBtn">
                <Save strokeWidth={1} />
              </Button>
              <p className="text-gray">Memory</p>
            </div>
          </div>
        </div>
      </div>

     
      <div className="flex flex-col gap-3 ">
        <p className="font-semibold">Memory size (In bytes)</p>
        <div className="relative">
        <div className="absolute top-1/2 left-[0.6rem] -translate-y-1/2 text-gray-400">
            < Grid2x2Plus strokeWidth={1}width={20} height={20} /> 
        </div>
        <input className="relative rounded-lg border border-gray-400 cursor-pointer z-[2] bg-transparent py-2 pr-2 pl-[2.3rem] w-full" type="number" id="memorySizeInput"  value="32" min="32" max="512" step="4"
            placeholder="e.g. 200, 1024..." />
        </div>
    </div>
  
    </div>
  );
};

export default ManualConfig;
