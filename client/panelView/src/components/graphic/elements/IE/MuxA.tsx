import MuxContainer from "../MUXContainer";
import { Handle, Position } from "@xyflow/react";
import { useCurrentInst } from "@/context/graphic/CurrentInstContext";
import { useOperation } from "@/context/panel/OperationContext";
import LabelValueWithHover from "@/components/graphic/elements/LabelValueWithHover";

interface HandlerConfig {
  id: string;
  position: Position;
  style: React.CSSProperties;
  type: "source" | "target";
}

function MuxA() {
  const { currentResult } = useCurrentInst();
  const { operation } = useOperation();

  const signal = currentResult.alua.signal;

  const handlers: HandlerConfig[] = [
    {
      id: "pc",
      type: "target",
      position: Position.Left,
      style: { top: "2.8rem" },
    },
    {
      id: "registersUnitA",
      type: "target",
      position: Position.Left,
      style: { top: "6.8rem" },
    },
    {
      id: "aluASrc",
      type: "target",
      position: Position.Top,
      style: { top: "1.5rem" },
    },
    {
      id: "muxA_output",
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

export default MuxA;
