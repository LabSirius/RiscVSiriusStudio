import { Handle, Position } from "@xyflow/react";
import ContainerSVG from "../../ContainerSVG";
import LabelValueContainer from "./LabelValueContainer";
import { useSimulator } from "@/context/shared/SimulatorContext";
import ClockTriangle from "@/components/graphic/ClockTriangle";

export default function PC() {
  const { operation } = useSimulator();

  return (
    <div className="w-full h-full">
      <div className="relative w-full h-full">
        <h2 className="titleInElement top-[15%] left-[20%] -translate-x-[20%] -translate-y-[15%]">
          PC
        </h2>
        <div className="relative w-full h-full">
          <ContainerSVG height={15} active={true} />
          {operation !== "uploadMemory" && <LabelValueContainer />}
        </div>
        <ClockTriangle  />
      </div>

      <Handle type="target" position={Position.Left} className="input" style={{ top: "10.6rem" }} />

      <Handle
        type="source"
        position={Position.Right}
        className="output"
        style={{ top: "7.28rem" }}
      />
    </div>
  );
}
