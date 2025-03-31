// this file contains the edges for the ALUOp_ALU component

import { Edge, MarkerType  } from '@xyflow/react';

export const ALUOp_ALU: Edge[] = [

    { id: 'aluOp->ALU',  source: 'aluOp', target: 'alu', targetHandle: 'aluOp',  type: 'smoothstep', animated:true, markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 18,
        height: 18,
        color: '#888888',
     },},
   
];
