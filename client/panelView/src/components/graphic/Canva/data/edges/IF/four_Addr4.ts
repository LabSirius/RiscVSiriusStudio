// This file contains the connection between the constant 4 and the adder

import { Edge, MarkerType  } from '@xyflow/react';

export const four_Addr4: Edge[] = [
     { id: 'four->adder4',  source: 'four', target: 'adder4', targetHandle: 'fourTarget', type: 'default', markerEnd:
      {
        type: MarkerType.ArrowClosed,
        color: '#888888',
        width: 9,
        height: 9,
      },
    },
];
