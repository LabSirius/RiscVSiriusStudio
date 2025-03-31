// this file contains the edges for the instruction memory and control unit

import { Edge, MarkerType  } from '@xyflow/react';

export const IM_CU: Edge[] = [

    {
        id: 'pivot3->controlUnit[6:0]',
        source: 'pivot3',
        target: 'controlUnit',
        targetHandle: '[6:0]',
        type: 'smoothstep',
        animated: true,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 18,
          height: 18,
          color: '#888888',
        },
      },
      {
        id: 'pivot3->controlUnit[14:12]',
        source: 'pivot3',
        target: 'controlUnit',
        targetHandle: '[14:12]',
        type: 'smoothstep',
        animated: true,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 18,
          height: 18,
          color: '#888888',
        },
      },
      {
        id: 'pivot3->controlUnit[35:25]',
        source: 'pivot3',
        target: 'controlUnit',
        targetHandle: '[35:25]',
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
