// This pivot is used to mark the lines between pc->adder4 and pc->muxA

import { Handle, Position } from '@xyflow/react';

export default function Pivot1() {
  return (
    <div style={{ width: 0, height: 0, opacity: 0, position: 'relative' }}>
      <Handle
        type="target"
        position={Position.Bottom}
      />
      <Handle
        type="source"
        position={Position.Top}
      />
      <Handle
        type="source"
        id="muxA"
        position={Position.Right}
      />
    </div>
  );
}
