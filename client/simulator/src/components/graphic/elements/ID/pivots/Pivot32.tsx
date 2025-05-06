// This pivot is used to bring from RS2 to the MUXB and the branch unit
import { Handle, Position } from "@xyflow/react";

export default function Pivot32() {
  return (
    <div style={{ width: 0, height: 0, opacity: 0, position: "relative" }}>
      <Handle type="target" position={Position.Left} />

      <Handle type="source" id="[14:12]" position={Position.Bottom} />
    </div>
  );
}
