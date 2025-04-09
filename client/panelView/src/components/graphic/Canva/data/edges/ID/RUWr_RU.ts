//This file contains the connection of the write multiplexer result, with the RU

import { Edge, MarkerType  } from '@xyflow/react';

export const RUWr_RU: Edge[] = [

    { id: 'ruWr->registersUnit',  source: 'ruWr', target: 'registersUnit', targetHandle: 'ruWr', type: 'step',  markerEnd:
        {
          type: MarkerType.ArrowClosed,
          color: '#888888',
          width: 8,
          height: 8,
        },
    },
]