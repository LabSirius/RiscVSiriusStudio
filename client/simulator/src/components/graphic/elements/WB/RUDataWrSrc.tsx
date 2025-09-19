import { Handle, Position } from "@xyflow/react";

import { useOverlay } from "@/context/graphic/OverlayContext";
import { useCurrentInst } from "@/context/graphic/CurrentInstContext";
import { useSimulator } from "@/context/shared/SimulatorContext";

export default function RUDataWrSrc() {
  const { overlayWBActive } = useOverlay();
  const { typeSimulator, isEbreak, operation } = useSimulator();
  const { currentType, pipelineValuesStages } = useCurrentInst();

  const inactive =
    typeSimulator === "pipeline"
      ? pipelineValuesStages.WB.instruction.type === "S" ||
        pipelineValuesStages.WB.instruction.type === "B" ||
        pipelineValuesStages.WB.instruction.pc === -1
      : currentType === "S" || currentType === "B";
  return (
    <div className="w-full">
      <div className="relative w-full h-full">
        <h2
          className={` titleInElement top-[.3rem] left-[50%] -translate-[50%]   ${
            overlayWBActive && "overlay-scale"
          } ${(operation !== "uploadMemory" ? inactive || isEbreak : false) &&  "!text-[#D3D3D3]"}`}>
          RUDataWrSrc
        </h2>
      </div>

      <div className={`${overlayWBActive && "overlay-moveX"}`}>
        <Handle
          type="source"
          position={Position.Top}
          className="output-tunnel"
          style={{ top: "-.4rem" }}
        />
      </div>
    </div>
  );
}
