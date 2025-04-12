import MuxContainer from "../MUXContainer";
import { Handle, Position } from "@xyflow/react";
import { useCurrentInst } from "@/context/graphic/CurrentInstContext";
import LabelValue from "@/components/graphic/LabelValue";
import { useOperation } from "@/context/panel/OperationContext";

function MuxD() {
  const { currentResult } = useCurrentInst();
  const { operation } = useOperation();

  return (
    <div className="relative w-full h-full">
      <div className="relative w-full h-full">
        <MuxContainer />
        {operation !== "uploadMemory" && (
          <div className="absolute top-[-3rem] left-[3rem]">
            <LabelValue label="" value={`b'${currentResult.buMux.signal}`} input={false} />
          </div>
        )}
      </div>

      <Handle
        type="target"
        position={Position.Left}
        id="adder4"
        className="input"
        style={{ top: "2.8rem" }}
      />

      <Handle
        type="target"
        position={Position.Left}
        id="alu"
        className="input"
        style={{ top: "6.8rem" }}
      />

      <Handle
        type="target"
        id="bu"
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

export default MuxD;
