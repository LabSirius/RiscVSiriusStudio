// This file contains the connections between Instruction memory and Registers unit

import { Edge, MarkerType  } from '@xyflow/react';

export const IM_RU: Edge[] = [

  {
    id: 'instructionMemory->pivot3',
    source: 'instructionMemory',
    target: 'pivot3',
    type: 'smoothstep',
  },
  {
    id: 'pivot3->RegistersUnit[11:7]',
    source: 'pivot3',
    sourceHandle: '[11:7]',
    target: 'registersUnit',
    targetHandle: '[11:7]',
    type: 'step',
    markerEnd: {
      type: MarkerType.ArrowClosed,
      width: 18,
      height: 18,
      color: '#888888',
    },
  },
  {
    id: 'pivot3->RegistersUnit[24:20]',
    source: 'pivot3',
    sourceHandle: '[24:20]',
    target: 'registersUnit',
    targetHandle: '[24:20]',
    type: 'step',
    markerEnd: {
      type: MarkerType.ArrowClosed,
      width: 18,
      height: 18,
      color: '#888888',
    },
  },
  {
    id: 'pivot3->RegistersUnit[19:15]',
    source: 'pivot3',
    sourceHandle: '[19:15]',
    target: 'registersUnit',
    targetHandle: '[19:15]',
    type: 'step',
    markerEnd: {
      type: MarkerType.ArrowClosed,
      width: 18,
      height: 18,
      color: '#888888',
    },
  },
 
];
