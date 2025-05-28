import ContainerPipelineRegister from "../ContainerPipelineRegister";
import { Handle, Position } from "@xyflow/react";

const RUrs1_EX = () => {
  return (
    <div className="relative w-full overflow-visible">
      <ContainerPipelineRegister text="RUrs1_IE" top={true} />

      <Handle type="target" position={Position.Left} className="input" style={{ top: "2.46rem" }} />

      <Handle
        type="source"
        position={Position.Right}
        className="output"
        style={{ right: "-2.4rem", top: "2.46rem" }}
      />
    </div>
  );
};

export default RUrs1_EX;
