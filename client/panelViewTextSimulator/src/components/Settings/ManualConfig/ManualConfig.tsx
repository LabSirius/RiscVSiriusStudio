import MemorySizeInput from "../MemorySizeInput";
import ImportRegister from "./ImportRegister";

import { RedoDot } from "lucide-react";
import ImportMemory from "./ImportMemory";

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
          <ImportMemory />
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
