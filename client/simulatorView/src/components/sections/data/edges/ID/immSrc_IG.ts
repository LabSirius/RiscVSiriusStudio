// This file contains the connection between the immSrc and the immediate generator

import { Edge, MarkerType  } from '@xyflow/react';

export const immSrc_IG: Edge[] = [

    { id: 'immSrc->immGenerator',  source: 'immSrc', target: 'immGenerator', targetHandle: 'immSrc', type: 'smoothstep', animated: true,  markerEnd:
        {
          type: MarkerType.ArrowClosed,
          width: 18,
          height: 18,
          color: '#888888',
        },
    },
]