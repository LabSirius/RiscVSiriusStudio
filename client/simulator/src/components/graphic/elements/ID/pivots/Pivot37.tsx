// This pivot is used to bring from RS2 to the MUXB and the branch unit
import { Handle, Position } from "@xyflow/react";

export default function Pivot37() {
  return (
    <div style={{ width: 0, height: 0, opacity: 0, position: "relative" }}>
      <Handle type="target" position={Position.Bottom} />

      <Handle type="source" position={Position.Left} />
    </div>
  );
}
