// this file contains the edges for the IMMGENERATOR_MUX2_1B component

import { Edge, MarkerType  } from '@xyflow/react';

export const IG_MUXB: Edge[] = [
    {
        id: 'immGenerator->muxB',  
        source: 'immGenerator', 
        target: 'muxB', 
        targetHandle: 'immGenerator', 
        type: 'smoothstep', 
        animated: true,  
        markerEnd:
        {
          type: MarkerType.ArrowClosed,
          width: 18,
          height: 18,
          color: '#888888',
        },
    },

    
];
