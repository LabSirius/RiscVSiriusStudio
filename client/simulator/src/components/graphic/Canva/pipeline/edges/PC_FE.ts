import { Edge, MarkerType  } from '@xyflow/react';

export const PC_FE: Edge[] = [
    { id: 'muxD->pc_fe',  source: 'muxD', target: 'pc_fe', type: 'step', markerEnd:
        {
         type: MarkerType.ArrowClosed,
         color: '#888888',
         width: 8,
        height: 8,
       },
     },

     { id: 'pc_fe->pc',  source: 'pc_fe', target: 'pc', type: 'step', markerEnd:
        {
         type: MarkerType.ArrowClosed,
         color: '#888888',
         width: 8,
        height: 8,
       },
     },
];
