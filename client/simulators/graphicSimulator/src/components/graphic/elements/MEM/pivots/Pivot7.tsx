// This pivot is used to bring rs2 into the dataMemory
import { Handle, Position } from '@xyflow/react';

export default function Pivot7() {
  return (
    <div style={{width: 0, height: 0, opacity: 0,  position: 'relative' }}>

      <Handle
        type="target"
        id="alu"
        position={Position.Left}
      />

      <Handle
        type="source"
        id='muxD'
        position={Position.Top} />
       <Handle
        type="source"
        id="dataMemory"
        position={Position.Right} />
       <Handle
        type="source"
        id="wb"
        position={Position.Bottom} />
    </div>
  );
}
