// This file contains the connections between Instruction memory and inmmediate generator

import { Edge, MarkerType  } from '@xyflow/react';

export const IM_IG: Edge[] = [
     {
       id: 'pivot3->pivot26',
        source: 'pivot3',
        sourceHandle: '[31:7]',
       target: 'pivot26',
       type: 'smoothstep',
     },
     {
      id: 'pivot26->pivotJump1',
       source: 'pivot26',
       sourceHandle: 'immGenerator',
      target: 'pivotJump1',
      type: 'default',
    },
      {
        id: 'pivotJump1->immediateGenerator[31:7]',
         source: 'pivotJump1',
        target: 'immGenerator',
        targetHandle: '[31:7]',
        type: 'smoothstep',
        markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 8,
         height: 8,
        color: '#888888',
       },
},
];
