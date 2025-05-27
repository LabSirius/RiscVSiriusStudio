import ContainerPipelineRegister from "../ContainerPipelineRegister";
import { Handle, Position } from "@xyflow/react";

const PC_FE = () => {
  return (
    <div className="relative w-full overflow-visible">
      <ContainerPipelineRegister text="PC_fe" />

      <Handle type="target" position={Position.Top} className="input" style={{ left: "2.2rem" }} />

      <Handle
        type="source"
        position={Position.Right}
        className="output"
        style={{ right: "-2.4rem" }}
      />
    </div>
  );
};

export default PC_FE;
