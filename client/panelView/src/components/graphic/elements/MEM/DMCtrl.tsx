import { Handle, Position } from "@xyflow/react";
import { useOverlay } from "@/context/graphic/OverlayContext";
import { useCurrentInst } from "@/context/graphic/CurrentInstContext";
import { useOperation } from "@/context/panel/OperationContext";

export default function DMCtrl() {
  const { overlayMemoryActive } = useOverlay();
  const { currentType } = useCurrentInst();
  const { isFirstStep } = useOperation();

  return (
    <div className="w-full">
      <div className="relative w-full h-full">
        <h2
          className={`titleInElement  top-[-1.9rem]  left-[50%] -translate-x-[50%]   ${
            overlayMemoryActive && "overlay-scale"
          } ${!(currentType === "L" || currentType === "S" || !isFirstStep) && "!text-[#D3D3D3]"}`}>
          DMCtrl
        </h2>
      </div>

      <div className={`${overlayMemoryActive && "overlay-moveX-t"}`}>
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
