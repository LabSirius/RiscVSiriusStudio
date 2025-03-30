// this file contains the edges for the RU_MUX2 component

import { Edge, MarkerType  } from '@xyflow/react';

export const RU_MUXS: Edge[] = [
    {
        id: 'registersUnit->muxA',
        source: 'registersUnit',
        sourceHandle: 'muxA',
        target: 'muxA',
        targetHandle: 'registersUnitA',
        type: 'smoothstep',
        animated: true,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 18,
          height: 18,
          color: '#FF0072',
        },
    },
    {
      id: 'registersUnit->muxB',
      source: 'registersUnit',
      sourceHandle: 'muxB',
      target: 'muxB',
      targetHandle: 'registersUnitB',
      type: 'smoothstep',
      animated: true,
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 18,
        height: 18,
        color: '#FF0072',
      },
  },
];
