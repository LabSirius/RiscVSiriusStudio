// This pivot is used to mark the cut points between the instruction memory and what is received by the control unit, the registers unit, and the imm generator of the instruction memory.
import { Handle, Position } from '@xyflow/react';

export default function Pivot4() {
  return (
    <div style={{ width: 0, height: 0, opacity: 0, position: 'relative' }}>
      <Handle
        type="target"
        position={Position.Left}
        style={{ width: 10, height: 10 }}
      />
      <Handle
        type="source"
        id='muxA'
        position={Position.Right}
        style={{ width: 10, height: 10 }}
      />
      <Handle
        type="source"
        id='branchUnit'
        position={Position.Top}
        style={{ width: 10, height: 10 }}
      />
    </div>
  );
}
