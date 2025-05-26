// This file contains the connection between the Registers unit and the muxs A and B

import { Edge, MarkerType  } from '@xyflow/react';

export const RU_MUXS: Edge[] = [

    {
      id: 'pivotJump4->pivot4',
      source: 'pivotJump4',
      target: 'pivot4',
      type: 'default'
  },
  {
      id: 'pivot4->muxA',
      source: 'pivot4',
      sourceHandle: 'muxA',
      target: 'muxA',
      targetHandle: 'registersUnitA',
      type: 'smoothstep',
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: '#888888',
        width: 8,
        height: 8,
      },
  },

  {
    id: 'pivot2->muxB',
    source: 'pivot2',
    sourceHandle: 'muxB',
    target: 'muxB',
    targetHandle: 'registersUnitB',
    type: 'smoothstep',
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: '#888888',
      width: 8,
      height: 8,
    },
  }
];
