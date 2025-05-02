import { Handle, Position } from '@xyflow/react';

export default function Pivot10() {
  return (
    <div style={{ width: 0, height: 0, opacity: 0, position: 'relative' }}>
      <Handle
        type="target"
        position={Position.Left}
      />
      <Handle
        type="source"
        id='muxA'
        position={Position.Top}
      />
    </div>
  );
}
