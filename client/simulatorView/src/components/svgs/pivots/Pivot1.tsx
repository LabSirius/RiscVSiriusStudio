<<<<<<< HEAD
// This pivot is used to mark the lines between pc->adder4 and pc->muxA

import { Handle, Position } from '@xyflow/react';

export default function Pivot1() {
=======
// This pivot is used to mark the cut of the line between the jump pivot 1 (brings the pc) and the muxA

import { Handle, Position } from '@xyflow/react';

<<<<<<<< HEAD:client/simulatorView/src/components/svgs/pivots/Pivot2.tsx
export default function Pivot2() {
========
export default function Pivot1() {
>>>>>>>> 253534b (The logic of component names is changed before adding more pivots.):client/simulatorView/src/components/svgs/pivots/Pivot1.tsx
>>>>>>> 253534b (The logic of component names is changed before adding more pivots.)
  return (
    <div style={{ width: 0, height: 0, opacity: 0, position: 'relative' }}>
      <Handle
        type="target"
<<<<<<< HEAD
=======
        position={Position.Left}
        style={{ width: 10, height: 10 }}
      />
      <Handle
        type="source"
>>>>>>> 253534b (The logic of component names is changed before adding more pivots.)
        position={Position.Bottom}
        style={{ width: 10, height: 10 }}
      />
      <Handle
        type="source"
<<<<<<< HEAD
        position={Position.Top}
        style={{ width: 10, height: 10 }}
      />
      <Handle
        type="source"
        id="muxA"
        position={Position.Right}
=======
        id="mux2_1A"
        position={Position.Bottom}
>>>>>>> 253534b (The logic of component names is changed before adding more pivots.)
        style={{ width: 10, height: 10 }}
      />
    </div>
  );
}
