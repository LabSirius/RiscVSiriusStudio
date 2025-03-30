// this file contains the edges for the RU_MUX2 component

import { Edge, MarkerType  } from '@xyflow/react';

export const RU_MUX2: Edge[] = [
    {
        id: 'registersUnit->mux2_1A',
        source: 'registersUnit',
        sourceHandle: 'mux2_1A',
        target: 'mux2_1A',
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
      id: 'registersUnit->mux2_1B',
      source: 'registersUnit',
      sourceHandle: 'mux2_1B',
      target: 'mux2_1B',
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
