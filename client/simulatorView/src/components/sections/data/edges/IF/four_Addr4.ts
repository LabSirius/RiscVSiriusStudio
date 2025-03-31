// This file contains the connection between the constant 4 and the adder

import { Edge, MarkerType  } from '@xyflow/react';

export const four_Addr4: Edge[] = [
     { id: 'four->adder4',  source: 'four', target: 'adder4', targetHandle: 'fourTarget', type: 'default', animated: true,  markerEnd:
      {
        type: MarkerType.ArrowClosed,
        width: 18,
        height: 18,
        color: '#888888',
      },
    },
];
