// This file contains the connection between the data memory and the MUXC

import { Edge, MarkerType  } from '@xyflow/react';

export const RU_MuxC: Edge[] = [

    { id: 'dataMemory->muxC',  source: 'dataMemory', target: 'muxC', targetHandle: 'dataMemory',  type: 'step', markerEnd: {
        type: MarkerType.ArrowClosed,
        color: '#888888',
        width: 9,
        height: 9,
     },},
   
];
