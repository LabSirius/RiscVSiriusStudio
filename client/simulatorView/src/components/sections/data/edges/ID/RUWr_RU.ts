//This file contains the connection of the write multiplexer result, with the RU

import { Edge, MarkerType  } from '@xyflow/react';

export const RUWr_RU: Edge[] = [

    { id: 'ruWr->registersUnit',  source: 'ruWr', target: 'registersUnit', targetHandle: 'ruWr', type: 'step', animated: true,  markerEnd:
        {
          type: MarkerType.ArrowClosed,
          width: 18,
          height: 18,
          color: '#888888',
        },
    },
]