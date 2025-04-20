import MuxContainer from "../MUXContainer";
import { Handle, Position } from "@xyflow/react";
import { useCurrentInst } from "@/context/graphic/CurrentInstContext";
import { useOperation } from "@/context/panel/OperationContext";
import LabelValueWithHover from "@/components/graphic/elements/LabelValueWithHover";

function MuxB() {
  const { currentResult } = useCurrentInst();
  const { operation } = useOperation();

  const signal = currentResult.alub.signal;

  return (
    <div className="relative w-full h-full">
      <div className="relative w-full h-full">
        <MuxContainer />
        {operation !== "uploadMemory" && (
          <div className="absolute bottom-[-2.3rem] left-[3.5rem]">
            <LabelValueWithHover
              label=""
              value={`b'${signal}`}
              decimal={signal}
              binary={signal}
              hex={signal}
              input={false}
              positionClassName=""
            />
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
