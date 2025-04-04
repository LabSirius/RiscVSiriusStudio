// This file contains the connections between Instruction memory and Registers unit

import { Edge, MarkerType  } from '@xyflow/react';

export const IM_RU: Edge[] = [

  {
    id: 'instructionMemory->pivot3',
    source: 'instructionMemory',
    target: 'pivot3',
    type: 'smoothstep',
    animated: true,
  },
  {
    id: 'pivot3->RegistersUnit[11:7]',
    source: 'pivot3',
    sourceHandle: '[11:7]',
    target: 'registersUnit',
    targetHandle: '[11:7]',
    type: 'step',
    animated: true,
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: '#888888',
    },
  },
  {
    id: 'pivot3->pivot20',
    source: 'pivot3',
    sourceHandle: '[24:20]',
    target: 'pivot20',
    type: 'smoothstep',
    animated: true,
  },

  {
    id: 'pivot20->RegistersUnit[24:20]',
    source: 'pivot20',
    sourceHandle: '[24:20]',
    target: 'registersUnit',
    targetHandle: '[24:20]',
    type: 'step',
    animated: true,
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: '#888888',
    },
  },

  {
    id: 'pivot20->pivot21',
    source: 'pivot20',
    sourceHandle: '[19:15]',
    target: 'pivot21',
    type: 'step',
    animated: true
  },


  {
    id: 'pivot21->RegistersUnit[19:15]',
    source: 'pivot21',
    sourceHandle: '[19:15]',
    target: 'registersUnit',
    targetHandle: '[19:15]',
    type: 'step',
    animated: true,
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: '#888888',
    },
  },
 
];
