/*
* In this file  we define the initial edges for the flowchart (connections between nodes).
* Each edge has an id, source node, target node, and type.
*/

import { Edge, MarkerType  } from '@xyflow/react';

export const initialEdges: Edge[] = [
  { id: 'pc->instMemory',  source: 'pc', target: 'instructionMemory', type: 'animatedSvg', animated: true,  markerEnd:
     {
    type: MarkerType.ArrowClosed,
    width: 18,
    height: 18,
    color: '#FF0072',
  },
  },
  { id: 'pc->adder4',  source: 'pc', target: 'adder4',  targetHandle: 'pcTarget', type: 'animatedSvg', animated: true,  markerEnd:
    {
   type: MarkerType.ArrowClosed,
   width: 18,
   height: 18,
   color: '#FF0072',
 },
 },
 { id: 'four->adder4',  source: 'four', target: 'adder4', targetHandle: 'fourTarget', type: 'animatedSvg', animated: true,  markerEnd:
  {
 type: MarkerType.ArrowClosed,
 width: 18,
 height: 18,
 color: '#FF0072',
},
},
];
