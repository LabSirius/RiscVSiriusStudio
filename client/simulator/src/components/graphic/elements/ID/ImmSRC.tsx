import { Handle, Position } from "@xyflow/react";
import { useOverlay } from "@/context/graphic/OverlayContext";
import { useCurrentInst } from "@/context/graphic/CurrentInstContext";
import { useSimulator } from "@/context/shared/SimulatorContext";

export default function ImmSrc() {
  const { typeSimulator, operation, isEbreak } = useSimulator();
  const { overlayDecodeActive } = useOverlay();
  const { currentType, pipelineValuesStages } = useCurrentInst();

  const inactive = operation !== "uploadMemory" &&   (typeSimulator === "pipeline" ? pipelineValuesStages.ID.instruction.pc === -1 || pipelineValuesStages.ID.instruction.type === "R" : currentType === "R");

  return (
    <div className="w-full">
      <div className="relative w-full h-full">
        <h2
          className={`titleInElement right-[.7rem] top-[40%] -translate-y-[40%]  ${
            overlayDecodeActive && "overlay-scale"
          } ${(inactive || isEbreak) && "!text-[#D3D3D3]"}`}>
          IMMSrc
        </h2>
      </div>

      <div className={`${overlayDecodeActive && "overlay-moveY"}`}>
        <Handle
          type="source"
          position={Position.Right}
          className="output-tunnel"
          style={{ top: "1.2rem" }}
        />
      </div>
    </div>
  );
}
