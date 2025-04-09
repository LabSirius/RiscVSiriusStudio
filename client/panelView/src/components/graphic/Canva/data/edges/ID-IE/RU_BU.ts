// This file contains the connection between the Registers unit and the branch unit

import { Edge, MarkerType } from '@xyflow/react';

export const RU_BU: Edge[] = [
    {
        id: 'pivot4->branchUnit',
        source: 'pivot4',
        sourceHandle: 'branchUnit',
        target: 'branchUnit',
        targetHandle: 'RS1',
        type: 'smoothstep',
         markerEnd: {
                type: MarkerType.ArrowClosed,
                color: '#888888',
                width: 8,
                height: 8,
        },
    },

    {
        id: 'pivot2->branchUnit',
        source: 'pivot2',
        sourceHandle: 'branchUnit',
        target: 'branchUnit',
        targetHandle: 'RS2',
        type: 'smoothstep',
         markerEnd: {
                type: MarkerType.ArrowClosed,
                color: '#888888',
                width: 8,
                height: 8,
        },
    },





   
];
