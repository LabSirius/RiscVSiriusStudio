import MemorySizeInput from "./MemorySizeInput";
import ImportRegister from "../ImportRegister";

import { Button } from "@/components/ui/button";
import { RedoDot, Save } from "lucide-react";

const ManualConfig = () => {

  return (
    <div className="flex flex-col gap-7">
      <p className="flex text-gray-400 text-md">
        Press
        <span className="inline mx-2 text-slate-400">
          <RedoDot strokeWidth={1} />
        </span>{" "}
        to execute the first instruction
      </p>

      <div className="flex flex-col gap-2 mt-1">
        <p>Import data</p>
        <div className="flex items-center gap-3 mt-2">

          <ImportRegister />
          <div className="flex items-center gap-2 ml-4">
            <input
              type="file"
              id="fileInputImportMemory"
              accept=".txt"
              className="hidden"
            />
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" id="importMemoryBtn">
                <Save strokeWidth={1} />
              </Button>
              <p className="text-gray">Memory</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <p className="font-semibold">Memory size (In bytes)</p>
        <MemorySizeInput />
      </div>
    </div>
  );
};

export default ManualConfig;
