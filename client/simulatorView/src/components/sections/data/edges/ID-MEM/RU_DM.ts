// this file contains the edges for the ID-MEM section of the simulator (instruction memory and data memory)

import { Edge, MarkerType  } from '@xyflow/react';

export const RU_DM: Edge[] = [

  {
    id: 'pivot2->pivot5',
    source: 'pivot2',
    sourceHandle: 'dataMemory',
    target: 'pivot5',
    type: 'step',
    animated: true
  },

  {
    id: 'pivot5->dataMemory',
    source: 'pivot5',
    target: 'dataMemory',
    targetHandle: 'rs2',
    type: 'smoothstep',
    animated: true,
    markerEnd: {
      type: MarkerType.ArrowClosed,
      width: 18,
      height: 18,
      color: '#888888',
    },
  }
];
