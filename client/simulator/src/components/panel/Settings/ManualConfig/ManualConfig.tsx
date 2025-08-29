import MemorySizeInput from "../MemorySizeInput";
import ImportRegister from "./ImportRegister";

import { RedoDot } from "lucide-react";
import ImportMemory from "./ImportMemory";

const ManualConfig = () => {
  return (
    <div className="flex flex-col gap-7 ">
      <p className="flex text-gray-400 text-md">
        Press
        <span className="inline mx-2 text-slate-400">
          <RedoDot strokeWidth={1} />
        </span>{" "}
        to execute the first instruction
      </p>

      <div className="flex flex-col gap-2" id="import-data">
        <p>Import data</p>
        <div className="flex items-center gap-3 mt-2" >
          <ImportRegister />
          <ImportMemory />
        </div>
      </div>

      <MemorySizeInput />
    </div>
  );
};

export default ManualConfig;
