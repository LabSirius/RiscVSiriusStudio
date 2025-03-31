// this file contains the edge between the instruction memory and the immediate generator

import { Edge, MarkerType  } from '@xyflow/react';

export const IM_IG: Edge[] = [

    {
        id: 'pivot3->immediateGenerator[31:7]',
        source: 'pivot3',
        target: 'immGenerator',
        targetHandle: '[31:7]',
        type: 'smoothstep',
        animated: true,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 18,
          height: 18,
          color: '#888888',
        },
      },
];
