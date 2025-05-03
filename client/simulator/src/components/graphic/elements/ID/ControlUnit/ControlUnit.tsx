import { Handle, Position } from "@xyflow/react";
import ContainerSVG from "../../ContainerSVG";

import Tunels from "./outputTunnels/Tunels";
import LabelSlashConatiner from "./LabelSlashContainer";
import LabelValueContainer from "./LabelValueContainer";
import { useSimulator } from "@/context/shared/SimulatorContext";

interface InputHandlerConfig {
  id: string;
  top: string;
}

export default function ControlUnit() {
  const { operation } = useSimulator();

  const inputHandlers: InputHandlerConfig[] = [
    { id: "[6:0]", top: "2.7rem" },
    { id: "[14:12]", top: "7.9rem" },
    { id: "[31:25]", top: "13.2rem" },
  ];

  return (
    <div className="relative w-full">
      <h2 className="titleInElement absolute top-[50%] left-[80%] -translate-x-[80%] -translate-y-[50%]">
        Control Unit
      </h2>
      <div className="relative">
        <ContainerSVG height={16} active={true} />

        {operation !== "uploadMemory" && (
          <>
            <LabelSlashConatiner />
            <LabelValueContainer />
          </>
        )}

        <Tunels />
      </div>

      {/* Render input handlers programmatically */}
      {inputHandlers.map((handler) => (
        <Handle
          key={handler.id}
          type="target"
          id={handler.id}
          position={Position.Left}
          className="input"
          style={{ top: handler.top }}
        />
      ))}
    </div>
  );
}
