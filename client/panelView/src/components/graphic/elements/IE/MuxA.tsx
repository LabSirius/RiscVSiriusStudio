import MuxContainer from "../MUXContainer";
import { Handle, Position } from "@xyflow/react";
import { useCurrentInst } from "@/context/graphic/CurrentInstContext";
import { useOperation } from "@/context/panel/OperationContext";
import LabelValueWithHover from "@/components/graphic/elements/LabelValueWithHover";

function MuxA() {
  const { currentResult } = useCurrentInst();
  const { operation } = useOperation();

  const signal = currentResult.alua.signal;

  return (
    <div className="relative w-full h-full">
      <div className="relative w-full h-full">
        <MuxContainer />
        {operation !== "uploadMemory" && (
          <div className="absolute top-[-2.7rem] left-[3.5rem]">
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
