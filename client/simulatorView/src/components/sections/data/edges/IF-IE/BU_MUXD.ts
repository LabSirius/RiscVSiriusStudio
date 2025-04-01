// This file contains the connection between the BU and the MUXD

import { Edge  } from '@xyflow/react';

export const BU_MUXD: Edge[] = [

    { id: 'branchUnit->pivot14',  source: 'branchUnit', target: 'pivot14',  type: 'smoothstep', animated:true},
   
];
