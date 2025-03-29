/*
* In this file  we define the initial edges for the flowchart (connections between nodes).
* Each edge has an id, source node, target node, and type.
*/

import { Edge, MarkerType  } from '@xyflow/react';
import { IM_RU } from './IM_RU';
import { IM_CU } from './IM_CU';
import { PC_ADDR4 } from './PC_ADDR4';

export const initialEdges: Edge[] = [

  ...PC_ADDR4, // PC to Instruction Memory and Adder 4 connections
  
 
  { id: 'four->adder4',  source: 'four', target: 'adder4', targetHandle: 'fourTarget', type: 'smoothstep', animated: true,  markerEnd:
    {
      type: MarkerType.ArrowClosed,
      width: 18,
      height: 18,
      color: '#FF0072',
    },
  },

  ...IM_RU,  // Instruction Memory to Register Unit connections
  ...IM_CU, // Instruction Memory to Control Unit connections
];
