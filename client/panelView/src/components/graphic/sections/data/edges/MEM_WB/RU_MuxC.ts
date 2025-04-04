// This file contains the connection between the data memory and the MUXC

import { Edge, MarkerType  } from '@xyflow/react';

export const RU_MuxC: Edge[] = [

    { id: 'dataMemory->muxC',  source: 'dataMemory', target: 'muxC', targetHandle: 'dataMemory',  type: 'step', animated:true, markerEnd: {
        type: MarkerType.ArrowClosed,
        color: '#888888',
     },},
   
];
