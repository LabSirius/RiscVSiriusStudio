import ContainerPipelineRegister from "../ContainerPipelineRegister";
import { Handle, Position } from "@xyflow/react";

const CU_MEM = () => {
  return (
    <div className="relative w-full overflow-visible">
      <ContainerPipelineRegister height={5} />


      <Handle
        type="target"
         id={"2"}
        position={Position.Left}
        className="input"
        style={{ right: "-2.4rem", top: "2rem" }}
      />

      <Handle
        type="target"
         id={"3"}
        position={Position.Left}
        className="input"
        style={{ right: "-2.4rem", top: "3.9rem" }}
      />

      

      <Handle
        type="source"
         id={"1"}
        position={Position.Right}
        className="output"
        style={{ right: "-2.4rem", top: "2rem" }}
      />

      <Handle
        type="source"
        id={"2"}
        position={Position.Right}
        className="output"
        style={{ right: "-2.4rem", top: "3.9rem" }}
      />

  
    </div>
  );
};

export default CU_MEM;
