import { Handle, Position } from "@xyflow/react";
import { useOverlay } from "@/context/graphic/OverlayContext";
import { useSimulator } from "@/context/shared/SimulatorContext";
import { useCurrentInst } from "@/context/graphic/CurrentInstContext";

export default function ALUASrc() {
  const { typeSimulator, operation, isEbreak} = useSimulator();

  const {pipelineValuesStages} = useCurrentInst()
  
  const { overlayExecuteActive } = useOverlay();

  const isActive = operation === "uploadMemory" || ( typeSimulator === "pipeline" ? pipelineValuesStages.EX.instruction.pc !== -1 : true)


  return (
    <div className="w-full">
      <div className="relative w-full h-full">
        <h2
          className={` titleInElement top-[-1.9rem]   ${overlayExecuteActive && "overlay-scale"} ${(isEbreak || !isActive) && "!text-[#D3D3D3]"} `}>
          ALUASrc{typeSimulator === 'pipeline' && '_ex'}
        </h2>
      </div>

      <div className={`${overlayExecuteActive && "overlay-moveX-t"}`}>
        <Handle
          type="source"
          position={Position.Bottom}
          className="output-tunnel"
          style={{ top: "1rem" }}
        />
      </div>
    </div>
  );
}
