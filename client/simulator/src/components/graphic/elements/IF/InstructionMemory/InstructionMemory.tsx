import ContainerSVG from "../../ContainerSVG";
import { Handle, Position } from "@xyflow/react";
import LabelSlash from "@/components/graphic/LabelSlash";
import LabelValueContainer from "./LabelValueContainer";
import { useSimulator } from "@/context/shared/SimulatorContext";

export default function InstructionMemory() {
    const { operation, typeSimulator } = useSimulator();
  
  return (
    <div className="w-full h-full">
      <div className="relative w-full h-full">
        <h2 className="titleInElement top-[15%] left-[80%]  -translate-x-[80%] -translate-y-[15%] !z-0 ">
          Instruction Memory
        </h2>

        <div className="relative">
          <ContainerSVG height={15} active={true} />

          {operation !== "uploadMemory" && typeSimulator === "monocycle" && (
            <>
              <div className="absolute bottom-[7.4rem] right-[-2.5rem]">
                <LabelSlash number={32} />
              </div>
              <LabelValueContainer />
            </>
          )}
        </div>
      </div>
      <Handle type="target" position={Position.Left} className="input" style={{ top: "7.25rem" }} />

      <Handle
        type="source"
        position={Position.Right}
        className="output"
        style={{ top: "10.03rem" }}
      />
    </div>
  );
}
