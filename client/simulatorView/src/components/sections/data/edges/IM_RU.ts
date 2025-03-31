// this file contains the edges for the instruction memory to registers unit

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
    id: 'pivot3->RegistersUnit[17:7]',
    source: 'pivot3',
    target: 'registersUnit',
    targetHandle: '[17:7]',
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
    id: 'pivot3->RegistersUnit[24:20]',
    source: 'pivot3',
    target: 'registersUnit',
    targetHandle: '[24:20]',
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
    id: 'pivot3->RegistersUnit[19:15]',
    source: 'pivot3',
    target: 'registersUnit',
    targetHandle: '[19:15]',
    type: 'smoothstep',
    animated: true,
    markerEnd: {
      type: MarkerType.ArrowClosed,
      width: 18,
      height: 18,
      color: '#888888',
    },
  },
 
];
