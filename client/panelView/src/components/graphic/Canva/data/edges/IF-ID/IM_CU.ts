// This file contains the connections between IM and RU

import { Edge, MarkerType  } from '@xyflow/react';

export const IM_CU: Edge[] = [


  {
    id: 'pivot21->pivot22',
    source: 'pivot21',
    sourceHandle: 'pivot22',
    target: 'pivot22',
    type: 'step'
  },

    {
        id: 'pivot22->controlUnit[35:25]',
        source: 'pivot22',
        sourceHandle: '[35:25]',
        target: 'controlUnit',
        targetHandle: '[35:25]',
        type: 'step',
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: '#888888',
        },
    },


    {
      id: 'pivot22->pivot23',
      source: 'pivot22',
      sourceHandle: 'pivot23',
      target: 'pivot23',
      type: 'step',
    },
      {
        id: 'pivot23->controlUnit[14:12]',
        source: 'pivot23',
        sourceHandle: '[14:12]',
        target: 'controlUnit',
        targetHandle: '[14:12]',
        type: 'step',
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: '#888888',
        },
      },

      {
        id: 'pivot23->pivot24',
        source: 'pivot23',
        sourceHandle: 'pivot24',
        target: 'pivot24',
        type: 'step',

      },
      {
        id: 'pivot24->controlUnit[6:0]',
        source: 'pivot24',
        sourceHandle: '[6:0]',
        target: 'controlUnit',
        targetHandle: '[6:0]',
        type: 'step',
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: '#888888',
        },
      },
 
];
