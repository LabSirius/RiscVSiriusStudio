// This file contains the connection between the ALU and the data memory.

import { Edge, MarkerType  } from '@xyflow/react';

export const ALU_DM: Edge[] = [

  {
    id: 'alu->pivot7',  
    source: 'alu', 
    sourceHandle: 'dataMemory',
    target: 'pivot7', 
    targetHandle: 'alu', 
    type: 'smoothstep',
  },
  
  {
    id: 'pivot7->dataMemory',  
    source: 'pivot7', 
    sourceHandle: 'dataMemory',
    target: 'dataMemory', 
    targetHandle: 'alu', 
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

