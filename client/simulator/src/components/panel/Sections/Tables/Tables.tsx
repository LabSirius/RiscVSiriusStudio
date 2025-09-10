import RegisterTable from "./RegisterTable";
import AvailableMemoryTable from "./MemoryTable/AvailableMemoryTable/AvailableMemoryTable";
// import StagesPipeline from "./StagesPipeline";
import { useSimulator } from "@/context/shared/SimulatorContext";
import ProgramMemoryTable from "./MemoryTable/ProgramMemory";
import ProgramSection from "../ProgramSection";
import AvailableHexMemoryTable from "./MemoryTable/AvailableMemoryTable/AvailableHexMemoryTable";
import { useState } from "react";

const Tables = () => {

  const {  modeSimulator } = useSimulator();

  const [withBin, setWithBin] = useState(true);

  return (
    <div className="flex gap-0 overflow-hidden min-w-min">
      <RegisterTable />

      <div className="flex gap-0 overflow-hidden min-w-min" id="memoryTables">
        <AvailableMemoryTable withBin={withBin} setWithBin={setWithBin} />

        <AvailableHexMemoryTable withBin={withBin} setWithBin={setWithBin} />

        <ProgramMemoryTable />
      </div>

      {modeSimulator !== "text" && <ProgramSection />}
      {/* {typeSimulator === "pipeline" && <StagesPipeline />} */}
    </div>
  );
};

export default Tables;
