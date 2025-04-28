// This pivot is used to bring from RS2 to the MUXB and the branch unit
import { Handle, Position } from '@xyflow/react';

export default function Pivot23() {
  return (
    <div style={{width: 0, height: 0, opacity: 0,  position: 'relative' }}>

      <Handle
        type="target"
        position={Position.Bottom}
      />
      <Handle
        type="source"
        id='[14:12]'
        position={Position.Right} />

    <Handle
        type="source"
        id='pivot24'
        position={Position.Top} />
    </div>
  );
}
