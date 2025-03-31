// this file contains the edges for the RU_MUXS component

import { Edge, MarkerType } from '@xyflow/react';

export const RU_BU: Edge[] = [
    {
        id: 'pivot4->branchUnit',
        source: 'pivot4',
        sourceHandle: 'branchUnit',
        target: 'branchUnit',
        targetHandle: 'RS1',
        type: 'smoothstep',
        animated: true,
         markerEnd: {
                type: MarkerType.ArrowClosed,
                width: 18,
                height: 18,
                color: '#888888',
        },
    },

   
];
