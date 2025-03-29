import { Handle, Position } from '@xyflow/react';

export default function PcPivotAdder4() {
  return (
    <div style={{ width: 0, height: 0, opacity: 0, position: 'relative' }}>
      <Handle
        type="target"
        position={Position.Bottom}
        style={{ width: 10, height: 10 }}
      />
      <Handle
        type="source"
        position={Position.Right}
        style={{ width: 10, height: 10 }}
      />
    </div>
  );
}
