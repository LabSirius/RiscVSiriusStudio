import { Edge, MarkerType  } from '@xyflow/react';

export const PC_DE: Edge[] = [
    { id: 'pivot1->pc_de',  source: 'pivot1', target: 'pc_de', type: 'step', markerEnd:
        {
         type: MarkerType.ArrowClosed,
         color: '#888888',
         width: 8,
        height: 8,
       },
     },

     
];
