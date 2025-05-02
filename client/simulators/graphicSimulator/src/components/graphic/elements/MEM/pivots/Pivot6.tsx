// This pivot is used to bring rs2 into the dataMemory
import { Handle, Position } from '@xyflow/react';

export default function Pivot6() {
  return (
    <div style={{width: 0, height: 0, opacity: 0,  position: 'relative' }}>

      <Handle
        type="target"
        position={Position.Left}
      />
      <Handle
        type="source"
        position={Position.Top} />
    </div>
  );
}
