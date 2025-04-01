// This file contains the connection between the BU and the MUXD

import { Edge  } from '@xyflow/react';

export const ALU_MUXD: Edge[] = [

    { id: 'pivot7->pivot16',  source: 'pivot7', sourceHandle:'muxD', target: 'pivot16',  type: 'smoothstep', animated:true},
    { id: 'pivot16->pivot17',  source: 'pivot16', target: 'pivot17',  type: 'smoothstep', animated:true}
   
];
