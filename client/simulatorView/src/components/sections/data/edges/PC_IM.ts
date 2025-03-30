// this file contains the edges for the program counter and instruction memory

import { Edge, MarkerType  } from '@xyflow/react';

export const PC_IM: Edge[] = [
    { id: 'pc->instMemory',  source: 'pc', target: 'instructionMemory', type: 'smoothstep', animated: true,  markerEnd:
        {
         type: MarkerType.ArrowClosed,
         width: 18,
         height: 18,
         color: '#FF0072',
       },
     },
];
