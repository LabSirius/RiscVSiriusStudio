// This pivot is used to bring from RS2 to the MUXB and the branch unit
import { Handle, Position } from "@xyflow/react";

export default function Pivot34() {
  return (
    <div style={{ width: 0, height: 0, opacity: 0, position: "relative" }}>
      <Handle type="target" position={Position.Left} />

      <Handle type="source" id="dataMemory" position={Position.Right} />

      <Handle type="source" id="alures_wb" position={Position.Bottom} />
    </div>
  );
}
