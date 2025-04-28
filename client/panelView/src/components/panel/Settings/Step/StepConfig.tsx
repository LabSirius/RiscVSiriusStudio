import MemorySizeInput from "../MemorySizeInput";
import ExportMemory from "./ExportMemory";
import ExportRegisters from "./ExportRegisters";

const StepConfig = () => {
  return (
    <div className="flex flex-col gap-7">
        <div className="flex flex-col gap-3">
        <p className="font-semibold">Memory size (In bytes)</p>
            <MemorySizeInput disabled={true}/>
        </div>
        <div className="flex flex-col gap-2 mt-1">
        <p>Export data</p>
        <div className="flex items-center gap-3 mt-2">

          <ExportRegisters />
          <ExportMemory />
        </div>
      </div>
    </div>

  )
}

export default StepConfig