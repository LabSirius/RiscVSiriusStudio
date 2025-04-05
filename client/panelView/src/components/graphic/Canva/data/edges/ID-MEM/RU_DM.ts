// this file contains the edges for the ID-MEM section of the simulator (instruction memory and data memory)

import { Edge, MarkerType  } from '@xyflow/react';

export const RU_DM: Edge[] = [

  {
    id: 'pivot2->pivot5',
    source: 'pivot2',
    sourceHandle: 'dataMemory',
    target: 'pivot5',
    type: 'step'
  },
  
  {
    id: 'pivot5->pivotJump5',
    source: 'pivot5',
    target: 'pivotJump5',
    type: 'default'
  },

  {
    id: 'pivotJump5->pivot6',
    source: 'pivotJump5',
    target: 'pivot6',
    type: 'step'
  },

  {
    id: 'pivot6->dataMemory',
    source: 'pivot6',
    target: 'dataMemory',
    targetHandle: 'rs2',
    type: 'smoothstep',
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: '#888888',
    },
  }
];
