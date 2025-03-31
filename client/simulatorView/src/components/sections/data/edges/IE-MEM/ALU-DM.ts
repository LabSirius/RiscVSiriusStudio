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
    animated: true,  
  },
  
  {
    id: 'pivot7->dataMemory',  
    source: 'pivot7', 
    sourceHandle: 'dataMemory',
    target: 'dataMemory', 
    targetHandle: 'alu', 
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

