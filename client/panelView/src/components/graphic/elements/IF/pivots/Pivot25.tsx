import { Handle, Position } from '@xyflow/react';

export default function Pivot25() {
  return (
    <div style={{ width: 0, height: 0, opacity: 0, position: 'relative' }}>
      <Handle
        type="target"
        position={Position.Left}
      />
      <Handle
        type="source"
        id='instructionMemory'
        position={Position.Right}
      />
      <Handle
        type="source"
        id='adder4'
        position={Position.Top}
      />
    </div>
  );
}
