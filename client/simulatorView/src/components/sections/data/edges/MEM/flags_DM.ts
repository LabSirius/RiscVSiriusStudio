// This file contains the connection between the constant 4 and the adder

import { Edge, MarkerType  } from '@xyflow/react';

export const flags_DM: Edge[] = [
     { id: 'dmWr->dataMemory',  source: 'dmWr', target: 'dataMemory', targetHandle: 'dmWr', type: 'step', animated: true,  markerEnd:
      {
        type: MarkerType.ArrowClosed,
        width: 18,
        height: 18,
        color: '#888888',
      },
    },
    { id: 'dmCtrl->dataMemory',  source: 'dmCtrl', target: 'dataMemory', targetHandle: 'dmCtrl', type: 'step', animated: true,  markerEnd:
        {
          type: MarkerType.ArrowClosed,
          width: 18,
          height: 18,
          color: '#888888',
        },
      },
];
