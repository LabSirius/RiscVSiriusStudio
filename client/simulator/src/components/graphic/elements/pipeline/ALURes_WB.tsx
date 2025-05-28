import ContainerPipelineRegister from "../ContainerPipelineRegister";
import { Handle, Position } from "@xyflow/react";

const ALURes_WB = () => {
  return (
    <div className="relative w-full overflow-visible">
      <ContainerPipelineRegister text="ALURes_wb" />

      <Handle type="target" position={Position.Left} className="input" style={{ top: "2.1rem" }} />

      <Handle
        type="source"
        position={Position.Right}
        className="output"
        style={{ right: "-2.4rem", top: "2.1rem" }}
      />
    </div>
  );
};

export default ALURes_WB;
