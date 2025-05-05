// This pivot is used to bring from RS2 to the MUXB and the branch unit
import { Handle, Position } from '@xyflow/react';

export default function Pivot22() {
  return (
    <div style={{width: 0, height: 0, opacity: 0,  position: 'relative' }}>

      <Handle
        type="target"
        id='[11:7]'
        position={Position.Bottom}
      />

      <Handle
        type="source"
        id='[11:7]'
        position={Position.Right}
      />

    <Handle
        type="source"
        id='[24:20]'
        position={Position.Top}
      />
  
   
    </div>
  );
}
