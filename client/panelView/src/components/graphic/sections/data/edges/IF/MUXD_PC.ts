import { Edge, MarkerType  } from '@xyflow/react';

export const MUXD_PC: Edge[] = [
    { id: 'muxD->pc',  source: 'muxD', target: 'pc', type: 'default', animated: true,  markerEnd:
        {
         type: MarkerType.ArrowClosed,
         color: '#888888',
       },
     },
];
