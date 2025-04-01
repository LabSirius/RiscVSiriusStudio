// This pivot is used to bring ALU into the MUXC
import { Handle, Position } from '@xyflow/react';

export default function Pivot13() {
  return (
    <div style={{width: 0, height: 0, opacity: 0,  position: 'relative' }}>

      <Handle
        type="target"
        position={Position.Left}
      />
      
      <Handle
        type="source"
        position={Position.Bottom} />
    </div>
  );
}
