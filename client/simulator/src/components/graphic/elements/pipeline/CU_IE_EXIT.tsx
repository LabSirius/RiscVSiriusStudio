import { useOverlay } from "@/context/graphic/OverlayContext";
import { Handle, Position } from "@xyflow/react";

export default function CU_IE_EXIT() {
  const { setOverlayExecuteActive } = useOverlay();

  return (
    <div
      className="w-full"
      onMouseEnter={() => setOverlayExecuteActive(true)}
      onMouseLeave={() => setOverlayExecuteActive(false)}>
      <div className="relative w-full h-full">
        <h2 className={` titleInElement top-[-1.8rem] `}>_IE</h2>
      </div>

      <div>
        <Handle
          type="target"
          position={Position.Bottom}
          className="output-tunnel"
          style={{ top: "1.2rem", left: "1.3rem" }}
        />
      </div>
    </div>
  );
}
