// this file contains the edges for the IMMGENERATOR_MUX2_1B component

import { Edge, MarkerType  } from '@xyflow/react';

export const IG_MUXB: Edge[] = [
  {
    id: 'immGenerator->pivot10',  
    source: 'immGenerator', 
    target: 'pivot10', 
    type: 'smoothstep', 
    animated: true, 
  },

  {
    id: 'pivot10->muxB',  
    source: 'pivot10', 
    target: 'muxB', 
    targetHandle: 'immGenerator', 
    type: 'smoothstep', 
    animated: true,  
    markerEnd:
    {
      type: MarkerType.ArrowClosed,
      color: '#888888',
    },
},
    

    
];
