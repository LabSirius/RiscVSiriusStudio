/*
* In this file  we define the initial edges for the flowchart (connections between nodes).
* Each edge has an id, source node, target node, and type.
*/

import { Edge, MarkerType  } from '@xyflow/react';

export const initialEdges: Edge[] = [
  { id: 'pc->instMemory',  source: 'pc', target: 'instructionMemory', type: 'smoothstep', animated: true,  markerEnd:
     {
      type: MarkerType.ArrowClosed,
      width: 18,
      height: 18,
      color: '#FF0072',
    },
  },

  { id: 'pc->pcPivotAdder4',  source: 'pc', target: 'pcPivotAdder4', type: 'smoothstep', animated: true},
  { id: 'pcPivotAdder4->adder4',  source: 'pcPivotAdder4', target: 'adder4', targetHandle: 'adder4Target', type: 'smoothstep', animated: true,  markerEnd:
    {
      type: MarkerType.ArrowClosed,
      width: 18,
      height: 18,
      color: '#FF0072',
    }
  },
 
  { id: 'four->adder4',  source: 'four', target: 'adder4', targetHandle: 'fourTarget', type: 'smoothstep', animated: true,  markerEnd:
    {
      type: MarkerType.ArrowClosed,
      width: 18,
      height: 18,
      color: '#FF0072',
    },
  },
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
  {
    id: 'instMemPivotRU->controlUnit[6:0]',
    source: 'instMemPivotRU',
    target: 'controlUnit',
    targetHandle: '[6:0]',
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
    id: 'instMemPivotRU->controlUnit[14:12]',
    source: 'instMemPivotRU',
    target: 'controlUnit',
    targetHandle: '[14:12]',
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
    id: 'instMemPivotRU->controlUnit[35:25]',
    source: 'instMemPivotRU',
    target: 'controlUnit',
    targetHandle: '[35:25]',
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
