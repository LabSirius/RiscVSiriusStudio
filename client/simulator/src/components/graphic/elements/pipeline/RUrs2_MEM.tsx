import ContainerPipelineRegister from "../ContainerPipelineRegister";
import { Handle, Position } from "@xyflow/react";

const RUrs2_MEM = () => {
  return (
    <div className="relative w-full overflow-visible">
      <ContainerPipelineRegister text="RUrs2_me" top={true} />
      <Handle type="target" position={Position.Left} className="input" style={{ top: "2.53rem" }} />

      <Handle
        type="source"
        position={Position.Right}
        className="output"
        style={{ right: "-2.4rem", top: "2.53rem" }}
      />
    </div>
  );
};

export default RUrs2_MEM;
