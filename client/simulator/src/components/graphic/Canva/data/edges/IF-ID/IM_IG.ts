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
       markerEnd: {
       type: MarkerType.ArrowClosed,
       width: 8,
        height: 8,
       color: '#888888',
      },
},
];
