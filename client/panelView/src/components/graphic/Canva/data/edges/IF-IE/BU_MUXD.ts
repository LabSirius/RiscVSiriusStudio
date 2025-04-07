// This file contains the connection between the BU and the MUXD

import { Edge, MarkerType  } from '@xyflow/react';

export const BU_MUXD: Edge[] = [

    { id: 'branchUnit->pivot14',  source: 'branchUnit', target: 'pivot14',  type: 'smoothstep'},
    { id: 'pivot14->pivotJump10',  source: 'pivot14', target: 'pivotJump10',  type: 'smoothstep'},
    { id: 'pivotJump10->pivot15',  source: 'pivotJump10', target: 'pivot15',  type: 'smoothstep'},
    { id: 'pivot15->muxD',  source: 'pivot15', target: 'muxD', targetHandle:'bu',  type: 'smoothstep', markerEnd: {
        type: MarkerType.ArrowClosed,
        color: '#888888',
        width: 9,
        height: 9,
    },},
   
];
