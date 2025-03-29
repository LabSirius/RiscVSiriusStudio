// this file contains the edges for the instruction memory to registers unit

import { Edge, MarkerType  } from '@xyflow/react';

export const IM_RU: Edge[] = [

  {
    id: 'instructionMemory->instMemPivotRU',
    source: 'instructionMemory',
    target: 'instMemPivotRU',
    type: 'smoothstep',
    animated: true,
  },
  {
    id: 'instMemPivotRU->RegistersUnit[17:7]',
    source: 'instMemPivotRU',
    target: 'registersUnit',
    targetHandle: '[17:7]',
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
    id: 'instMemPivotRU->RegistersUnit[24:20]',
    source: 'instMemPivotRU',
    target: 'registersUnit',
    targetHandle: '[24:20]',
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
    id: 'instMemPivotRU->RegistersUnit[19:15]',
    source: 'instMemPivotRU',
    target: 'registersUnit',
    targetHandle: '[19:15]',
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
