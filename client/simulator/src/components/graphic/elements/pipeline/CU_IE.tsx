import ContainerPipelineRegister from "../ContainerPipelineRegister";
import { Handle, Position } from "@xyflow/react";

const CU_IE = () => {
  return (
    <div className="relative w-full overflow-visible">
      <ContainerPipelineRegister height={6}/>

      <Handle
        type="source"
        id={"1"}
        position={Position.Right}
        className="output"
        style={{ right: "-2.4rem", top: "1.2rem" }}
      />

      <Handle
        type="source"
         id={"2"}
        position={Position.Right}
        className="output"
        style={{ right: "-2.4rem", top: "3rem" }}
      />

      <Handle
        type="source"
         id={"3"}
        position={Position.Right}
        className="output"
        style={{ right: "-2.4rem", top: "4.9rem" }}
      />
    </div>
  );
};

export default CU_IE;
