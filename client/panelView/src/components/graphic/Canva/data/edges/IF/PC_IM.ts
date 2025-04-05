// This file contains the connection between the program counter and the instruction memory

import { Edge, MarkerType  } from '@xyflow/react';

export const PC_IM: Edge[] = [
    { id: 'pc->instMemory',  source: 'pc', target: 'instructionMemory', type: 'smoothstep', markerEnd:
        {
         type: MarkerType.ArrowClosed,
         color: '#888888',
       },
     },
];
