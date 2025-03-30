// this file contains the edges for the IG_MUX2_1B component

import { Edge, MarkerType  } from '@xyflow/react';

export const IG_MUXB: Edge[] = [

    { id: 'immSrc->immGenerator',  source: 'immSrc', target: 'immGenerator', targetHandle: 'immSrc', type: 'smoothstep', animated: true,  markerEnd:
        {
          type: MarkerType.ArrowClosed,
          width: 18,
          height: 18,
          color: '#FF0072',
        },
    },

    {
        id: 'immGenerator->mux2B',  
        source: 'immGenerator', 
        target: 'mux2B', 
        targetHandle: 'immGenerator', 
        type: 'smoothstep', 
        animated: true,  
        markerEnd:
        {
          type: MarkerType.ArrowClosed,
          width: 18,
          height: 18,
          color: '#FF0072',
        },
    },

    
];
