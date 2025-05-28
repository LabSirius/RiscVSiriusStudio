import { Edge, MarkerType  } from '@xyflow/react';

export const PC_ID: Edge[] = [
    { id: 'pivot1->pc_id',  source: 'pivot1', target: 'pc_id', type: 'step', markerEnd:
        {
         type: MarkerType.ArrowClosed,
         color: '#888888',
         width: 8,
        height: 8,
       },
     },

     
];
