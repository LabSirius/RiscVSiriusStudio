// This file contains the edges for the PC_MUXA component

import { Edge, MarkerType  } from '@xyflow/react';

export const PC_MUXA: Edge[] = [

    { id: 'pivot1->pivotJump1',  source: 'pivot1', target: 'pivotJump1', sourceHandle: 'muxA',  type: 'smoothstep', animated:true},
    { id: 'pivotJump1->pivot2',  source: 'pivotJump1', target: 'pivot2',  type: 'smoothstep', animated:true},
    { id: 'pivot2->muxA',  source: 'pivot2', target: 'muxA', targetHandle: 'pc',  type: 'smoothstep', animated:true, markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 18,
        height: 18,
        color: '#FF0072',
     },},
   
];
