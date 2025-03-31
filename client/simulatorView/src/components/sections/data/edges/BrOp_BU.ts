// this file contains the edges for the BrOp to BranchUnit component

import { Edge, MarkerType  } from '@xyflow/react';

export const BrOp_BU: Edge[] = [

    { id: 'brOp->branchUnit',  source: 'brOp', target: 'branchUnit', targetHandle: 'brOp',  type: 'default', animated:true, markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 18,
        height: 18,
        color: '#888888',
     },},
   
];
