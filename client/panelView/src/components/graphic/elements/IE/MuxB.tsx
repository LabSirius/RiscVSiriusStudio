import MuxContainer from "../MUXContainer";
import { Handle, Position } from "@xyflow/react";
import { useCurrentInst } from "@/context/graphic/CurrentInstContext";
import { useOperation } from "@/context/panel/OperationContext";
import LabelValueWithHover from "@/components/graphic/elements/LabelValueWithHover";

interface HandlerConfig {
  id: string;
  type: "source" | "target";
  position: Position;
  style: React.CSSProperties;
}

function MuxB() {
  const { currentResult } = useCurrentInst();
  const { operation } = useOperation();

  const signal = currentResult.alub.signal;

  const handlers: HandlerConfig[] = [
    {
      id: "registersUnitB",
      type: "target",
      position: Position.Left,
      style: { top: "2.8rem" },
    },
    {
      id: "immGenerator",
      type: "target",
      position: Position.Left,
      style: { top: "6.8rem" },
    },
    {
      id: "aluBSrc",
      type: "target",
      position: Position.Bottom,
      style: { top: "7rem" },
    },
    {
      id: "muxB_output",
      type: "source",
      position: Position.Right,
      style: { right: ".8rem" },
    },
  ];

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

      {handlers.map((h) => (
        <Handle
          key={h.id}
          id={h.id}
          type={h.type}
          position={h.position}
          className={h.type === "source" ? "output" : "input"}
          style={h.style}
        />
      ))}
    </div>
  );
}

export default MuxB;
