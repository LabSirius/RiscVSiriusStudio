// This file contains the connection between the aluOp and the ALU

import { Edge, MarkerType  } from '@xyflow/react';

export const ALUOp_ALU: Edge[] = [

    { id: 'aluOp->ALU',  source: 'aluOp', target: 'alu', targetHandle: 'aluOp',  type: 'smoothstep', animated:true, markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 18,
        height: 18,
        color: '#888888',
     },},
   
];
