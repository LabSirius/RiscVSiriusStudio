import { Edge, MarkerType  } from '@xyflow/react';

export const MUXD_PC: Edge[] = [
    { id: 'muxD->pc',  source: 'muxD', target: 'pc', type: 'default',  markerEnd:
        {
         type: MarkerType.ArrowClosed,
         width: 18,
         height: 18,
         color: '#888888',
       },
     },
];
