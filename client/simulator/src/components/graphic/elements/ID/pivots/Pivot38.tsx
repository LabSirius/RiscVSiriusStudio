import { Handle, Position } from "@xyflow/react";

export default function Pivot38() {
  return (
    <div style={{ width: 0, height: 0, opacity: 0, position: "relative" }}>
      <Handle type="target" position={Position.Top} />

      <Handle type="source" id="rd_ie" position={Position.Right} />
      <Handle type="source" id="controlUnit" position={Position.Bottom} />

    </div>
  );
}
