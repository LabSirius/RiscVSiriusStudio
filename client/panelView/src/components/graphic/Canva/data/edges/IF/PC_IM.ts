// This file contains the connection between the program counter and the instruction memory

import { Edge, MarkerType  } from '@xyflow/react';

export const PC_IM: Edge[] = [
  { id: 'pc->pivot25',  source: 'pc', target: 'pivot25', type: 'default'
 },
    { id: 'pivot25->instMemory',  source: 'pivot25', sourceHandle: 'instructionMemory', target: 'instructionMemory', type: 'smootstephstep', markerEnd:
        {
         type: MarkerType.ArrowClosed,
         color: '#888888',
         width: 8,
         height: 8,
       },
     },
];
