// this file contains the edges for the IMMGENERATOR_MUX2_1B component

import { Edge, MarkerType  } from '@xyflow/react';

export const IG_MUXB: Edge[] = [
  {
    id: 'immGenerator->pivotJump5',  
    source: 'immGenerator', 
    target: 'pivotJump5', 
    type: 'smoothstep', 
  },
  {
    id: 'pivotJump5->pivot10',  
    source: 'pivotJump5', 
    target: 'pivot10', 
    type: 'smoothstep', 
  },

  {
    id: 'pivot10->muxB',  
    source: 'pivot10', 
    target: 'muxB', 
    targetHandle: 'immGenerator', 
    type: 'smoothstep',  
    markerEnd:
    {
      type: MarkerType.ArrowClosed,
      color: '#888888',
      width: 8,
      height: 8,
    },
},
    

    
];
