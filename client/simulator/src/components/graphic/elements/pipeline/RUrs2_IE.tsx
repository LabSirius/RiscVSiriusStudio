import ContainerPipelineRegister from "../ContainerPipelineRegister";
import { Handle, Position } from "@xyflow/react";

const RUrs2_IE = () => {
  return (
    <div className="relative w-full overflow-visible">
      <ContainerPipelineRegister text="RUrs2_IE" />
      <Handle type="target" position={Position.Left} className="input" style={{ top: "2rem" }} />

      <Handle
        type="source"
        position={Position.Right}
        className="output"
        style={{ right: "-2.4rem", top: "1.99rem" }}
      />
    </div>
  );
};

export default RUrs2_IE;
