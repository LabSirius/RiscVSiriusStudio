// This file contains the edges for the MUXS_ALU component

import { Edge, MarkerType  } from '@xyflow/react';

export const MUXS_ALU: Edge[] = [
   

     { id: 'muxA->alu',  source: 'muxA', target: 'alu', targetHandle: 'muxA', type: 'smoothstep', animated: true,  markerEnd:
       {
         type: MarkerType.ArrowClosed,
         width: 18,
         height: 18,
         color: '#888888',
       }
     },


     { id: 'muxB->alu',  source: 'muxB', target: 'alu', targetHandle: 'muxB', type: 'smoothstep', animated: true,  markerEnd:
      {
        type: MarkerType.ArrowClosed,
        width: 18,
        height: 18,
        color: '#888888',
      },
    },

     
];
