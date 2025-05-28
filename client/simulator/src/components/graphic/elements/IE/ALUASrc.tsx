import { Handle, Position } from "@xyflow/react";
import { useOverlay } from "@/context/graphic/OverlayContext";
import { useSimulator } from "@/context/shared/SimulatorContext";

export default function ALUASrc() {
  const { typeSimulator} = useSimulator();
  
  const { overlayExecuteActive } = useOverlay();

  return (
    <div className="w-full">
      <div className="relative w-full h-full">
        <h2
          className={` titleInElement top-[-1.9rem]   ${overlayExecuteActive && "overlay-scale"}`}>
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
