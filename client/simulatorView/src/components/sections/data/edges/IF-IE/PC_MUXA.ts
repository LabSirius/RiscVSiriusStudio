// This file contains the connection between the PC and the MUXA

import { Edge, MarkerType  } from '@xyflow/react';

export const PC_MUXA: Edge[] = [

    { id: 'pivot1->pivotJump1',  source: 'pivot1', target: 'pivotJump1', sourceHandle: 'muxA', animated: true,  type: 'smoothstep'},
    { id: 'pivotJump1->pivotJump2',  source: 'pivotJump1', target: 'pivotJump2', animated: true,  type: 'smoothstep'},
    { id: 'pivotJump2->pivotJump3',  source: 'pivotJump2', target: 'pivotJump3', animated: true, type: 'default'},
    { id: 'pivotJump3->muxA',  source: 'pivotJump3', target: 'muxA', targetHandle: 'pc', animated: true,  type: 'smoothstep', markerEnd: {
        type: MarkerType.ArrowClosed,
        color: '#888888',
     },},
   
];
