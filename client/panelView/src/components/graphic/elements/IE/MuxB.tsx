import MuxContainer from "../MUXContainer";
import { Handle, Position } from "@xyflow/react";
import { useCurrentInst } from "@/context/graphic/CurrentInstContext";
import LabelValue from "@/components/graphic/LabelValue";
import { useOperation } from "@/context/panel/OperationContext";

function MuxB() {
  const { currentResult } = useCurrentInst();
  const { operation } = useOperation();

  return (
    <div className="relative w-full h-full">
      <div className="relative w-full h-full">
        <MuxContainer />
        {operation !== "uploadMemory" && (
          <div className="absolute bottom-[-2.3rem] left-[3.5rem]">
            <LabelValue label="" value={`b'${currentResult.alub.signal}`} input={false} />
          </div>
        )}
      </div>
      <Handle
        type="target"
        id="registersUnitB"
        position={Position.Left}
        className="input"
        style={{ top: "2.8rem" }}
      />

      <Handle
        type="target"
        id="immGenerator"
        position={Position.Left}
        className="input"
        style={{ top: "6.8rem" }}
      />

      <Handle
        type="target"
        id="aluBSrc"
        position={Position.Bottom}
        className="input"
        style={{ top: "7rem" }}
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

export default MuxB;
