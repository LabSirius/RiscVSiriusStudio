// This file contains the connections between Instruction memory and inmmediate generator

import { Edge, MarkerType  } from '@xyflow/react';

export const IM_IG: Edge[] = [

     {
       id: 'pivot3->immediateGenerator[31:7]',
        source: 'pivot3',
        sourceHandle: '[31:7]',
       target: 'immGenerator',
       targetHandle: '[31:7]',
       type: 'smoothstep',
       animated: true,
       markerEnd: {
       type: MarkerType.ArrowClosed,
       color: '#888888',
      },
},
];
