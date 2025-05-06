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
 
];
