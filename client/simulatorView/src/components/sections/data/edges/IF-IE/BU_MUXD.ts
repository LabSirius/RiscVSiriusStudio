// This file contains the connection between the BU and the MUXD

import { Edge  } from '@xyflow/react';

export const BU_MUXD: Edge[] = [

    { id: 'branchUnit->pivot14',  source: 'branchUnit', target: 'pivot14',  type: 'smoothstep', animated:true},
    { id: 'pivot14->pivot15',  source: 'pivot14', target: 'pivot15',  type: 'smoothstep', animated:true},
    { id: 'pivot15->muxD',  source: 'pivot15', target: 'muxD', targetHandle:'bu',  type: 'smoothstep', animated:true},
   
];
