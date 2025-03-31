// this file contains the edges for the RU_MUXS component

import { Edge, MarkerType  } from '@xyflow/react';

export const RU_MUXS: Edge[] = [
    {
        id: 'registersUnit->pivot4',
        source: 'registersUnit',
        target: 'pivot4',
        type: 'smoothstep',
        animated: true
    },

    {
      id: 'pivot4->muxA',
      source: 'pivot4',
      sourceHandle: 'muxA',
      target: 'muxA',
      targetHandle: 'registersUnitA',
      type: 'smoothstep',
      animated: true,
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 18,
        height: 18,
        color: '#888888',
      },
  },
    
  {
    id: 'registersUnit->pivot2',
    source: 'registersUnit',
    sourceHandle: 'muxB',
    target: 'pivot2',
    type: 'smoothstep',
    animated: true,
  },

  {
    id: 'pivot2->muxB',
    source: 'pivot2',
    sourceHandle: 'muxB',
    target: 'muxB',
    targetHandle: 'registersUnitB',
    type: 'smoothstep',
    animated: true,
    markerEnd: {
      type: MarkerType.ArrowClosed,
      width: 18,
      height: 18,
      color: '#888888',
    },
  }
];
