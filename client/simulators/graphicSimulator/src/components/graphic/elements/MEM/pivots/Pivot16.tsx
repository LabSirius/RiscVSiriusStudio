// This pivot is used to bring rs2 into the dataMemory
import { Handle, Position } from '@xyflow/react';

export default function Pivot16() {
  return (
    <div style={{width: 0, height: 0, opacity: 0,  position: 'relative' }}>

      <Handle
        type="target"
        position={Position.Bottom}
      />

      <Handle
        type="source"
        position={Position.Left} />
    </div>
  );
}
