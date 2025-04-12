import MuxContainer from "../MUXContainer";
import { Handle, Position } from "@xyflow/react";
import { useCurrentInst } from "@/context/graphic/CurrentInstContext";
import LabelValue from "@/components/graphic/LabelValue";
import { useOperation } from "@/context/panel/OperationContext";

function MuxA() {
  const { currentResult } = useCurrentInst();
  const { operation } = useOperation();

  return (
    <div className="relative w-full h-full">
      <div className="relative w-full h-full ">
        <MuxContainer />
        {operation !== "uploadMemory" && (
          <div className="absolute top-[-2.7rem] left-[3.5rem]">
            <LabelValue label="" value={`b'${currentResult.alua.signal}`} input={false} />
          </div>
        )}
      </div>

      <Handle
        type="target"
        id="pc"
        position={Position.Left}
        className="input"
        style={{ top: "2.8rem" }}
      />

      <Handle
        type="target"
        id="registersUnitA"
        position={Position.Left}
        className="input"
        style={{ top: "6.8rem" }}
      />

      <Handle
        type="target"
        id="aluASrc"
        position={Position.Top}
        className="input"
        style={{ top: "1.5rem" }}
      />

      <Handle
        type="source"
        position={Position.Right}
        className="output"
        style={{ right: ".8rem" }}
      />
    </div>
  );
}

export default MuxA;
