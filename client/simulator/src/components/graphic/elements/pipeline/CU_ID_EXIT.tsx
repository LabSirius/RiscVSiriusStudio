import { Handle, Position } from "@xyflow/react";
import { useOverlay } from "@/context/graphic/OverlayContext";

export default function CU_ID_EXIT() {
  const { setOverlayDecodeActive } = useOverlay();

  return (
    <div
      className="w-full"
      onMouseEnter={() => setOverlayDecodeActive(true)}
      onMouseLeave={() => setOverlayDecodeActive(false)}>
      <div className="relative w-full h-full">
        <h2 className={` titleInElement top-[-1.8rem] `}>_ID</h2>
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
