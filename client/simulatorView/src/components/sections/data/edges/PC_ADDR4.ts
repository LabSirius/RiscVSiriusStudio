// this file contains the edges for the PC_ADDR4 component

import { Edge, MarkerType  } from '@xyflow/react';

export const PC_ADDR4: Edge[] = [

    { id: 'pc->instMemory',  source: 'pc', target: 'instructionMemory', type: 'smoothstep', animated: true,  markerEnd:
        {
         type: MarkerType.ArrowClosed,
         width: 18,
         height: 18,
         color: '#FF0072',
       },
     },
   
     { id: 'pc->pcPivotAdder4',  source: 'pc', target: 'pcPivotAdder4', type: 'smoothstep', animated: true},
     { id: 'pcPivotAdder4->adder4',  source: 'pcPivotAdder4', target: 'adder4', targetHandle: 'adder4Target', type: 'smoothstep', animated: true,  markerEnd:
       {
         type: MarkerType.ArrowClosed,
         width: 18,
         height: 18,
         color: '#FF0072',
       }
     },
];
