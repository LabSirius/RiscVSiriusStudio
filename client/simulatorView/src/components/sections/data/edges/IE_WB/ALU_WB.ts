// This file contains the connection between the ALU and the WB

import { Edge, MarkerType  } from '@xyflow/react';

export const ALU_WB: Edge[] = [
  
  {
    id: 'pivot7->pivot8',  
    source: 'pivot7', 
    sourceHandle: 'wb',
    target: 'pivot8', 
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

