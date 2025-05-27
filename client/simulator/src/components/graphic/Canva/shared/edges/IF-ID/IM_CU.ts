// This file contains the connections between Instruction memory and Registers unit

import { Edge, MarkerType  } from '@xyflow/react';

export const IM_CU: Edge[] = [

  {
    id: 'pivot26->pivot27',
    source: 'pivot26',
    sourceHandle: 'controlUnit',
    target: 'pivot27',
    type: 'step'
  },

  {
    id: 'pivot27->pivot28',
    source: 'pivot27',
    target: 'pivot28',
    type: 'step'
  },

  {
    id: 'pivot28->pivot29',
    source: 'pivot28',
    sourceHandle: '[6:0]',
    target: 'pivot29',
    type: 'step',
    markerEnd: {
        type: MarkerType.ArrowClosed,
        color: '#888888',
        width: 9,
        height: 9,
      },
  },

  {
    id: 'pivot28->pivot30',
    source: 'pivot28',
    sourceHandle: '[14:12]',
    target: 'pivot30',
    type: 'step'
  },

  {
    id: 'pivot30->pivot31',
    source: 'pivot30',
    sourceHandle: '[14:12]',
    target: 'pivot31',
    type: 'step',
    markerEnd: {
        type: MarkerType.ArrowClosed,
        color: '#888888',
        width: 9,
        height: 9,
      },
  },

  {
    id: 'pivot30->pivot32',
    source: 'pivot30',
    sourceHandle: '[31:25]',
    target: 'pivot32',
    type: 'step'
  },

  {
    id: 'pivot32->pivot33',
    source: 'pivot32',
    target: 'pivot33',
    type: 'step',
    markerEnd: {
        type: MarkerType.ArrowClosed,
        color: '#888888',
        width: 9,
        height: 9,
      },
  },
 
];
