import MuxContainer from "../MUXContainer";
import { Handle, Position } from "@xyflow/react";
import { useCurrentInst } from "@/context/graphic/CurrentInstContext";
import { useSimulator } from "@/context/shared/SimulatorContext";
import LabelValueWithHover from "@/components/graphic/elements/LabelValueWithHover";

interface HandlerConfig {
  id: string;
  type: "source" | "target";
  position: Position;
  style: React.CSSProperties;
}

function MuxB() {
  const { currentMonocycleResult, pipelineValuesStages } = useCurrentInst();
  const { operation, isEbreak, typeSimulator } = useSimulator();

  let signal: string;

  if (typeSimulator === 'pipeline') {
    const exStage = pipelineValuesStages?.EX;

    if (exStage?.instruction) {
      if (exStage.instruction.pc === -1) {
        signal = '-';
      } else {
        signal = exStage.ALUBSrc ? '1' : '0';
      }
    } else {
      signal = 'X';
    }
  } else {
    signal = currentMonocycleResult?.alub?.signal || 'X';
  }

  const handlers: HandlerConfig[] = [
    { id: "registersUnitB", type: "target", position: Position.Left, style: { top: "2.8rem" } },
    { id: "immGenerator", type: "target", position: Position.Left, style: { top: "6.8rem" } },
    { id: "aluBSrc", type: "target", position: Position.Bottom, style: { top: "7rem" } },
    { id: "muxB_output", type: "source", position: Position.Right, style: { right: ".8rem" } },
  ];

  return (
    <div className="relative w-full h-full">
      <div className="relative w-full h-full">
        <MuxContainer signal={signal === "0" ? "1" : "0"} />
        
        {operation !== "uploadMemory" && !isEbreak && (
          <div className="absolute bottom-[.8rem] left-[3.5rem]">
            <LabelValueWithHover
              label=""
              value={signal === '-' ? signal : `b'${signal}`}
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