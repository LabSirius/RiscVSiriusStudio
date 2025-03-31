// This file contains the connection between the ALU and the data memory.

import { Edge, MarkerType  } from '@xyflow/react';

export const ALU_DM: Edge[] = [
    {
        id: 'alu->dataMemory',  
        source: 'alu', 
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
