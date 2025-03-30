// This pivot is used to mark the cut of the line between the jump pivot 1 (brings the pc) and the muxA

import { Handle, Position } from '@xyflow/react';

<<<<<<<< HEAD:client/simulatorView/src/components/svgs/pivots/Pivot2.tsx
export default function Pivot2() {
========
export default function Pivot1() {
>>>>>>>> 253534b (The logic of component names is changed before adding more pivots.):client/simulatorView/src/components/svgs/pivots/Pivot1.tsx
  return (
    <div style={{ width: 0, height: 0, opacity: 0, position: 'relative' }}>
      <Handle
        type="target"
        position={Position.Left}
        style={{ width: 10, height: 10 }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ width: 10, height: 10 }}
      />
      <Handle
        type="source"
        id="mux2_1A"
        position={Position.Bottom}
        style={{ width: 10, height: 10 }}
      />
    </div>
  );
}
