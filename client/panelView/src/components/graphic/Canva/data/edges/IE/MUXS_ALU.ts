// This file contains the connection between the MUXs and the ALU

import { Edge, MarkerType  } from '@xyflow/react';

export const MUXS_ALU: Edge[] = [
   

     { id: 'muxA->alu',  source: 'muxA', target: 'alu', targetHandle: 'muxA', type: 'smoothstep',  markerEnd:
       {
         type: MarkerType.ArrowClosed,
         color: '#888888',
         width: 8,
         height: 8,
       }
     },


     { id: 'muxB->alu',  source: 'muxB', target: 'alu', targetHandle: 'muxB', type: 'smoothstep',  markerEnd:
      {
        type: MarkerType.ArrowClosed,
        color: '#888888',
        width: 8,
        height: 8,
      },
    },

     
];
