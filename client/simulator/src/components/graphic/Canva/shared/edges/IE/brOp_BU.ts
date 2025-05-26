// this file contains the edges for the BrOp to BranchUnit component

import { Edge, MarkerType  } from '@xyflow/react';

export const brOp_BU: Edge[] = [

    { id: 'brOp->branchUnit',  source: 'brOp', target: 'branchUnit', targetHandle: 'brOp',  type: 'default', markerEnd: {
        type: MarkerType.ArrowClosed,
        color: '#888888',
        width: 8,
        height: 8,
     },},
   
];
