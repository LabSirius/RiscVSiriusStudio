// This file contains the connection between the immSrc and the immediate generator

import { Edge, MarkerType  } from '@xyflow/react';

export const immSrc_IG: Edge[] = [

    { id: 'immSrc->immGenerator',  source: 'immSrc', target: 'immGenerator', targetHandle: 'immSrc', type: 'default',  markerEnd:
        {
          type: MarkerType.ArrowClosed,
          color: '#888888',
          width: 8,
          height: 8,
        },
    },
]