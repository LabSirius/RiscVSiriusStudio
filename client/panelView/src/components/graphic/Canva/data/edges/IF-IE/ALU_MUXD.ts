// This file contains the connection between the BU and the MUXD

import { Edge, MarkerType  } from '@xyflow/react';

export const ALU_MUXD: Edge[] = [

    { id: 'pivot7->pivot16',  source: 'pivot7', sourceHandle:'muxD', target: 'pivot16',  type: 'smoothstep'},
    { id: 'pivot16->pivot17',  source: 'pivot16', target: 'pivot17',  type: 'smoothstep'},
    { id: 'pivot17->muxD',  source: 'pivot17', target: 'muxD', targetHandle:'alu',  type: 'smoothstep',  markerEnd: {
        type: MarkerType.ArrowClosed,
        color: '#888888',
    },}
   
];
