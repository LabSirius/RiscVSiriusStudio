// This pivot is used to bring ALU into the MUXC
import { Handle, Position } from '@xyflow/react';

export default function Pivot8() {
  return (
    <div style={{width: 0, height: 0, opacity: 0,  position: 'relative' }}>

      <Handle
        type="target"
        position={Position.Top}
      />
      
      <Handle
        type="source"
        position={Position.Right} />
    </div>
  );
}
