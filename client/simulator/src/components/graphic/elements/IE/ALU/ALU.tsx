import { Handle, Position } from "@xyflow/react";
import ContainerSVG from "../../ContainerSVG";
import LabelValueContainer from "./LabelValueContainer";
import { useSimulator } from "@/context/shared/SimulatorContext";

interface HandlerConfig {
  id: string;
  position: Position;
  className: string;
  style?: React.CSSProperties;
}

export default function ALU() {
  const { operation, isEbreak } = useSimulator();
  

  const leftInputHandlers: HandlerConfig[] = [
    { id: "muxA", position: Position.Left, className: "input", style: { top: "6.7rem" } },
    { id: "muxB", position: Position.Left, className: "input", style: { top: "16.57rem" } },
  ];

  const bottomInputHandler: HandlerConfig = {
    id: "aluOp",
    position: Position.Bottom,
    className: "input",
    style: { bottom: "-1.25rem" }
  };

  const outputHandlers: HandlerConfig[] = [
    { id: "dataMemory", position: Position.Right, className: "output",  style: { top: "12.82rem" } },
  ];

  return (
    <div className="w-full">
      <div className="relative w-full h-full">
        <h2 className="titleInElement top-[1.95rem] left-[50%] transform -translate-x-[50%] !z-0 ">
          ALU
        </h2>
        <ContainerSVG height={22.9} active={!isEbreak} />
        {operation !== "uploadMemory" && !isEbreak && <LabelValueContainer />}
      </div>

      {leftInputHandlers.map((handler) => (
        <Handle
          key={handler.id}
          type="target"
          id={handler.id}
          position={handler.position}
          className={handler.className}
          style={handler.style}
        />
      ))}

      <Handle
        key={bottomInputHandler.id}
        type="target"
        id={bottomInputHandler.id}
        position={bottomInputHandler.position}
        className={bottomInputHandler.className}
         style={bottomInputHandler.style}
      />

      {outputHandlers.map((handler) => (
        <Handle
          key={handler.id}
          type="source"
          id={handler.id}
          position={handler.position}
          className={handler.className}
          style={handler.style}
        />
      ))}
    </div>
  );
}
