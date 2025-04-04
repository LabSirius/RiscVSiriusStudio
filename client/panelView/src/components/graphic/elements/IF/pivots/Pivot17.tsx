// This pivot is used to mark the lines between pc->adder4 and pc->muxA

import { Handle, Position } from '@xyflow/react';

export default function Pivot17() {
  return (
    <div style={{ width: 0, height: 0, opacity: 0, position: 'relative' }}>
      <Handle
        type="target"
        position={Position.Right}
        style={{ width: 10, height: 10 }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ width: 10, height: 10 }}
      />
    </div>
  );
}
