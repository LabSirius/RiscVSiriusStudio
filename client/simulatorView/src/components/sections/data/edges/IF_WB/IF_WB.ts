// This file contains the connections between IM and RU

import { Edge, MarkerType  } from '@xyflow/react';

export const IF_WB: Edge[] = [

    //Addr_MuxC connections

    
    {
      id: 'adder4->pivotJump8',
      source: 'adder4',
      target: 'pivotJump8',
      type: 'step',
      animated: true
    },
    {
        id: 'pivotJump8->pivot13',
        source: 'pivotJump8',
        target: 'pivot13',
        type: 'step',
        animated: true
      },


      {
        id: 'pivot13->muxC',
        source: 'pivot13',
        target: 'muxC',
        targetHandle: 'adder4',
        type: 'step',
        animated: true,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 18,
          height: 18,
          color: '#888888',
        },
      },
 
];
