import MuxContainer from "../MUXContainer";
import { Handle, Position } from "@xyflow/react";
import { useCurrentInst } from "@/context/graphic/CurrentInstContext";
import LabelValue from "@/components/graphic/LabelValue";
import { useOperation } from "@/context/panel/OperationContext";

interface HandlerConfig {
  id?: string;
  style: React.CSSProperties;
  position: Position;
}

export default function MuxC() {
  const { currentResult } = useCurrentInst();
  const { operation } = useOperation();

  const inputHandlers: HandlerConfig[] = [
    { id: "adder4", style: { top: "1.8rem" }, position: Position.Left },
    { id: "dataMemory", style: { top: "4.7rem" }, position: Position.Left },
    { id: "alu", style: { top: "7.5rem" }, position: Position.Left },
    { id: "ruDataWrSrc", style: { top: "7rem" }, position: Position.Bottom },
  ];

  const outputHandlers: HandlerConfig[] = [{ style: { right: ".8rem" }, position: Position.Right }];

  return (
    <div className="relative w-full h-full">
      <div className="relative w-full h-full">
        <MuxContainer />
        {operation !== "uploadMemory" && (
          <div className="absolute bottom-[-2.3rem] left-[3.5rem]">
            <LabelValue label="" value={`b'${currentResult.wb.signal}`} input={false} />
          </div>
        )}
      </div>

      {inputHandlers.map((handler, index) => (
        <Handle
          key={handler.id || `input-${index}`}
          type="target"
          id={handler.id}
          position={handler.position}
          className="input"
          style={handler.style}
        />
      ))}

      {outputHandlers.map((handler, index) => (
        <Handle
          key={`output-${index}`}
          type="source"
          position={handler.position}
          className="output"
          style={handler.style}
        />
      ))}
    </div>
  );
}
