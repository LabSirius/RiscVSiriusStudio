import { Handle, Position } from '@xyflow/react';

export default function Pivot25() {
  return (
    <div style={{ width: 0, height: 0, opacity: 0, position: 'relative' }}>
      <Handle
        type="target"
        position={Position.Left}
        style={{ width: 10, height: 10 }}
      />
      <Handle
        type="source"
        id='instructionMemory'
        position={Position.Right}
        style={{ width: 10, height: 10 }}
      />
      <Handle
        type="source"
        id='adder4'
        position={Position.Top}
        style={{ width: 10, height: 10 }}
      />
    </div>
  );
}
