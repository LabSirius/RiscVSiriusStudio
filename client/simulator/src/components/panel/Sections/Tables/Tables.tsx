import RegisterTable from "./RegisterTable";
import AvailableMemoryTable from "./MemoryTable/AvailableMemoryTable";
import StagesPipeline from "./StagesPipeline";
import { useSimulator } from "@/context/shared/SimulatorContext";
import ProgramMemoryTable from "./MemoryTable/ProgramMemory";
import ProgramSection from "../ProgramSection";

const Tables = () => {
  const { typeSimulator, modeSimulator } = useSimulator();
  return (
    <div className="flex gap-0 overflow-hidden min-w-min">
      <RegisterTable />
      <AvailableMemoryTable />
      <ProgramMemoryTable />
      {modeSimulator !== "text" && <ProgramSection/>}
      {typeSimulator === "pipeline" && (<StagesPipeline />)}
    </div>
  );
};

export default Tables;
