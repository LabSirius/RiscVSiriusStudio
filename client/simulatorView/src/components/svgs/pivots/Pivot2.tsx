// This pivot is used to mark the cut of the line between the jump pivot 1 (brings the pc) and the muxA

import { Handle, Position } from '@xyflow/react';

export default function Pivot2() {
  return (
    <div style={{ width: 0, height: 0, opacity: 0, position: 'relative' }}>
      <Handle
        type="target"
        position={Position.Left}
        style={{ width: 10, height: 10 }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
      />
    </div>
  );
}
