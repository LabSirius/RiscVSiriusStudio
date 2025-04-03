// This pivot is used to mark the cut points between the instruction memory and what is received by the control unit, the registers unit, and the imm generator of the instruction memory.
import { Handle, Position } from '@xyflow/react';

export default function Pivot3() {
  return (
    <div style={{ width: 0, height: 0, opacity: 0, position: 'relative' }}>
      <Handle
        type="target"
        position={Position.Left}
      />

      {/* CU */}
      <Handle
        type="source"
        id="[6:0]"
        position={Position.Top}
      />
      <Handle
        type="source"
        id="[14:12]"
        position={Position.Top}
      />
      <Handle
        type="source"
        id="[35:25]"
        position={Position.Top}
      />

      {/* RU */}

      <Handle
        type="source"
        id="[11:7]"
        position={Position.Right}
      />
      <Handle
        type="source"
        id="[24:20]"
        position={Position.Top}
      />
    </div>
  );
}
