import ContainerPipelineRegister from "../ContainerPipelineRegister";
import { Handle, Position } from "@xyflow/react";

const CU_WB = () => {
  return (
    <div className="relative w-full overflow-visible">
      <ContainerPipelineRegister text="" />


      <Handle
        type="target"
        position={Position.Left}
        className="input"
        style={{ right: "-2.4rem", top: "3.6rem" }}
      />

      <Handle
        type="source"
        position={Position.Right}
        className="output"
        style={{ right: "-2.4rem", top: "1rem" }}
      />

     

  
    </div>
  );
};

export default CU_WB;
