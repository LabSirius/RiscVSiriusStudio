import RegisterTable from "./RegisterTable";
import AvailableMemoryTable from "./MemoryTable/AvailableMemoryTable";
import StagesPipeline from "./StagesPipeline";
import { useSimulator } from "@/context/shared/SimulatorContext";
import ProgramMemoryTable from "./MemoryTable/ProgramMemory";

const Tables = () => {
  const { typeSimulator } = useSimulator();
  return (
    <div className="flex gap-0 overflow-hidden min-w-min">
      <RegisterTable />
      <AvailableMemoryTable />
      <ProgramMemoryTable />
      {typeSimulator === "pipeline" && (<StagesPipeline />)}
    </div>
  );
};

export default Tables;
