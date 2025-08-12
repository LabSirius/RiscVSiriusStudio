import { Handle, Position } from "@xyflow/react";
import ContainerSVG from "../../ContainerSVG";
import LabelSlashContainer from "./LabelSlashContainer";
import LabelValueContainer from "./LabelValueContainer";
import { useSimulator } from "@/context/shared/SimulatorContext";
import ClockTriangle from "@/components/graphic/ClockTriangle";

interface HandlerConfig {
  id: string;
  top: string; // This is the top value for styling
}

export default function RegistersUnit() {
  const { operation, isEbreak } = useSimulator();

  const inputHandlers: HandlerConfig[] = [
    { id: "[19:15]", top: "3.15rem" },
    { id: "[24:20]", top: "8.15rem" },
    { id: "[11:7]", top: "13.15rem" },
    { id: "dataWr", top: "19.17rem" },
    { id: "ruWr", top: "24.62rem" },
  ];

  const outputHandlers: HandlerConfig[] = [
    { id: "muxA", top: "17.4rem" },
    { id: "muxB", top: "24.36rem" },
  ];

  return (
    <div className="w-full">
      <div className="relative w-full h-full">
        <h2 className=" titleInElement top-[15%] left-[82%]  -translate-x-[82%] -translate-y-[15%] !z-0 ">
          Registers Unit
        </h2>
        <div className="relative">
          <ContainerSVG height={28} active={!isEbreak} />

          {operation !== "uploadMemory" && !isEbreak && (
            <>
              <LabelSlashContainer />
              <LabelValueContainer />
            </>
          )}
        </div>
        <ClockTriangle />
      </div>

      {inputHandlers.map((handler) => (
        <Handle
          key={handler.id}
          type="target"
          id={handler.id}
          position={Position.Left}
          className="input"
          style={{ top: handler.top }} // Using the top value here
        />
      ))}

      {outputHandlers.map((handler) => (
        <Handle
          key={handler.id}
          type="source"
          id={handler.id}
          position={Position.Right}
          className="output"
          style={{ top: handler.top }}
        />
      ))}
    </div>
  );
}
