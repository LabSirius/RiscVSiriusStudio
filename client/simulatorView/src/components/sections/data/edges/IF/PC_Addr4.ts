// This file contains the connection between the program counter and the adder

import { Edge, MarkerType  } from '@xyflow/react';

export const PC_Addr4: Edge[] = [
   
     { id: 'pc->pivot1',  source: 'pc', target: 'pivot1', animated: true, type: 'smoothstep'},
     { id: 'pivot1->adder4',  source: 'pivot1', target: 'adder4', targetHandle: 'pivot', animated: true, type: 'smoothstep',   markerEnd:
       {
         type: MarkerType.ArrowClosed,
         width: 18,
         height: 18,
         color: '#888888',
       }
     },
     
];
