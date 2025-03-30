// this file contains the edges for the PC_ADDR4 component

import { Edge, MarkerType  } from '@xyflow/react';

export const Pv_MUX2_1A: Edge[] = [

    { id: 'pcPivotAdder4->pcPivotMUXA',  source: 'pcPivotAdder4', target: 'pcPivotMUXA', type: 'smoothstep', animated:true,  markerEnd:
        {
         type: MarkerType.ArrowClosed,
         width: 18,
         height: 18,
         color: '#FF0072',
       },
     },
   
];
