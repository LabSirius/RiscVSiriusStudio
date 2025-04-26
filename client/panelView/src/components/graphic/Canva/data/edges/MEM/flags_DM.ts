// This file contains the connection between the constant 4 and the adder

import { Edge, MarkerType  } from '@xyflow/react';

export const flags_DM: Edge[] = [
     { id: 'dmWr->dataMemory',  source: 'dmWr', target: 'dataMemory', targetHandle: 'dmWr', type: 'step',  markerEnd:
      {
        type: MarkerType.ArrowClosed,
        color: '#888888',
        width: 8,
        height: 8,
      },
    },
    { id: 'dmCtrl->dataMemory',  source: 'dmCtrl', target: 'dataMemory', targetHandle: 'dmCtrl', type: 'step',  markerEnd:
        {
          type: MarkerType.ArrowClosed,
          color: '#888888',
          width: 8,
          height: 8,
        },
      },
];
