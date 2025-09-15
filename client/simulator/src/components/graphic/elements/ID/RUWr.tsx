import { Handle, Position } from "@xyflow/react";
import { useOverlay } from "@/context/graphic/OverlayContext";
import { useSimulator } from "@/context/shared/SimulatorContext";
import { useCurrentInst } from "@/context/graphic/CurrentInstContext";

export default function RUWr() {
  const { typeSimulator , isEbreak, operation} = useSimulator();
  const { overlayDecodeActive } = useOverlay();
  const { pipelineValuesStages} = useCurrentInst()


  const isActive = operation === "uploadMemory" || ( typeSimulator === "pipeline" ? pipelineValuesStages.WB.instruction.pc !== -1 && (pipelineValuesStages.WB.instruction.type !== "S" && pipelineValuesStages.WB.instruction.type !== "B") : true)

  

  return (
    <div className={`w-full`}>
      <div className="relative w-full h-full">
        <h2
          className={`titleInElement right-[1rem] top-[40%] -translate-y-[40%] ${(isEbreak || !isActive) && "!text-[#D3D3D3]"} ${
            overlayDecodeActive && "overlay-scale"
          }`}>
          RUWr
        </h2>
      </div>

      <div className={`${overlayDecodeActive && "overlay-moveY"}`}>
        <Handle type="source" position={Position.Right} className={`output-tunnel`} />
      </div>
    </div>
  );
}
