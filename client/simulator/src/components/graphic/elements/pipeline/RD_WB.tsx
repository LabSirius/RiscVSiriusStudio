import ContainerPipelineRegister from "../ContainerPipelineRegister";
import { Handle, Position } from "@xyflow/react";

const RD_WB = () => {
  return (
    <div className="relative w-full overflow-visible">
      <ContainerPipelineRegister text="rd_WB" />

      <Handle type="target" position={Position.Left} className="input" style={{ top: "2.2rem" }} />

      <Handle
        type="source"
        position={Position.Right}
        className="output"
        style={{ right: "-2.4rem", top: "2.2rem" }}
      />
    </div>
  );
};

export default RD_WB;
