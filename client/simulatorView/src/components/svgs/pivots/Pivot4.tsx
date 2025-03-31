// This pivot is used to mark the cut points between the instruction memory and what is received by the control unit, the registers unit, and the imm generator of the instruction memory.
import { Handle, Position } from '@xyflow/react';

export default function Pivot4() {
  return (
    <div style={{ width: 0, height: 0, opacity: 0, position: 'relative' }}>
      <Handle
        type="target"
        position={Position.Left}
      />
      <Handle
        type="source"
        id='muxA'
        position={Position.Right}
      />
      <Handle
        type="source"
        id='branchUnit'
        position={Position.Top}
      />
    </div>
  );
}
