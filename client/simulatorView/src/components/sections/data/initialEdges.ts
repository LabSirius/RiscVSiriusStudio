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
    id: 'instructionMemory->RegistersUnit',
    source: 'instructionMemory',
    target: 'registersUnit',
    targetHandle: 'instructionMemoryTarget',
    type: 'smoothstep',
    animated: true,
    markerEnd: {
      type: MarkerType.ArrowClosed,
      width: 18,
      height: 18,
      color: '#FF0072',
    },
    label: '[Inst 17:7] rd',
    labelStyle: { 
      fill: '#555555', 
      fontSize: 20,
      transform: 'translateY(-16px)',
      fontFamily: 'Verdana, sans-serif' 
    },
    labelBgStyle: { fill: 'transparent', stroke: 'none' },
    labelBgPadding: [0, 0],
    labelBgBorderRadius: 0,
  },
  
];
