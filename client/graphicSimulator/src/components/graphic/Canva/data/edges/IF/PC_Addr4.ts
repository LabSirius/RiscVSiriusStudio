// This file contains the connection between the program counter and the adder

import { Edge, MarkerType  } from '@xyflow/react';

export const PC_Addr4: Edge[] = [
   
     { id: 'pivot25->pivot1',  source: 'pivot25', sourceHandle:'adder4', target: 'pivot1',  type: 'smoothstep'},
     { id: 'pivot1->adder4',  source: 'pivot1', target: 'adder4', targetHandle: 'pivot',  type: 'smoothstep',   markerEnd:
       {
         type: MarkerType.ArrowClosed,
         color: '#888888',
         width: 8,
         height: 8,
       }
     },
     
];
