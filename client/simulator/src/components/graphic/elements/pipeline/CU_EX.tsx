import ContainerPipelineRegister from "../ContainerPipelineRegister";
import { Handle, Position } from "@xyflow/react";

const CU_EX = () => {
  return (
    <div className="relative w-full overflow-visible">
      <ContainerPipelineRegister text="" />

      <Handle
        type="source"
        id={"1"}
        position={Position.Right}
        className="output"
        style={{ right: "-2.4rem", top: "1rem" }}
      />

      <Handle
        type="source"
         id={"2"}
        position={Position.Right}
        className="output"
        style={{ right: "-2.4rem", top: "2.3rem" }}
      />

      <Handle
        type="source"
         id={"3"}
        position={Position.Right}
        className="output"
        style={{ right: "-2.4rem", top: "3.6rem" }}
      />
    </div>
  );
};

export default CU_EX;
