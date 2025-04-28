// This file contains the connections between IM and RU

import { Edge, MarkerType  } from '@xyflow/react';

export const IF_WB: Edge[] = [

    //Addr_MuxC connections

    
    {
      id: 'adder4->pivot18',
      source: 'adder4',
      target: 'pivot18',
      type: 'step',
    },

    {
      id: 'pivot18->pivotJump8',
      source: 'pivot18',
      sourceHandle: 'muxC',
      target: 'pivotJump8',
      type: 'step',
    },
   

      {
        id: 'pivotJump8->pivotJump9',
        source: 'pivotJump8',
        target: 'pivotJump9',
        type: 'step',

      },

      {
        id: 'pivotJump9->pivot13',
        source: 'pivotJump9',
        target: 'pivot13',
        type: 'step',

      },


      {
        id: 'pivot13->muxC',
        source: 'pivot13',
        target: 'muxC',
        targetHandle: 'adder4',
        type: 'step',
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: '#888888',
          width: 8,
          height: 8,
        },
      },


      //Addr_MuxC connections
      
    {
      id: 'pivot18->pivot19',
      source: 'pivot18',
      sourceHandle: 'muxD',
      target: 'pivot19',
      type: 'step',
    },

    {
      id: 'pivot19->muxD',
      source: 'pivot19',
      target: 'muxD',
      targetHandle: 'adder4',
      type: 'step',
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: '#888888',
        width: 8,
        height: 8,
      },
    },
 
];
