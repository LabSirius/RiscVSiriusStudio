import RegisterTable from "./RegisterTable";
import MemoryTable from "./MemoryTable";
import StagesPipeline from "./StagesPipeline";
import { useSimulator } from "@/context/shared/SimulatorContext";

const Tables = () => {
  const { typeSimulator } = useSimulator();
  return (
    <div className="flex gap-5 overflow-hidden min-w-min">
      <RegisterTable />
      <MemoryTable />
      {typeSimulator === "pipeline" && (<StagesPipeline />)}
    </div>
  );
};

export default Tables;
