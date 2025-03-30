// 

import { Edge, MarkerType  } from '@xyflow/react';

export const PC_MUXA: Edge[] = [

    { id: 'pcPivotAdder4->pcPivotMUXA',  source: 'pcPivotAdder4', target: 'pcPivotMUXA', type: 'smoothstep', animated:true,  markerEnd:
        {
         type: MarkerType.ArrowClosed,
         width: 18,
         height: 18,
         color: '#FF0072',
       },
     },
   
];
