// This file contains the connection between the aluOp and the ALU

import { Edge, MarkerType  } from '@xyflow/react';

export const ALUOp_ALU: Edge[] = [

    { id: 'aluOp->ALU',  source: 'aluOp', target: 'alu', targetHandle: 'aluOp',  type: 'smoothstep', markerEnd: {
        type: MarkerType.ArrowClosed,
        color: '#888888',
        width: 8,
        height: 8,
     },},
   
];
