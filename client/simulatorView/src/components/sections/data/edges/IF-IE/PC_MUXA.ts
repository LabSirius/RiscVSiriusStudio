// This file contains the connection between the PC and the MUXA

import { Edge, MarkerType  } from '@xyflow/react';

export const PC_MUXA: Edge[] = [

    { id: 'pivot1->pivotJump1',  source: 'pivot1', target: 'pivotJump1', sourceHandle: 'muxA',  type: 'smoothstep'},
    { id: 'pivotJump1->pivotJump2',  source: 'pivotJump1', target: 'pivotJump2',  type: 'smoothstep'},
    { id: 'pivotJump2->pivotJump3',  source: 'pivotJump2', target: 'pivotJump3',  type: 'default'},
    { id: 'pivotJump3->muxA',  source: 'pivotJump3', target: 'muxA', targetHandle: 'pc',  type: 'smoothstep', markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 18,
        height: 18,
        color: '#888888',
     },},
   
];
