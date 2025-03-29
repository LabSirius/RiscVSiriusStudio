/*
* In this file  we define the initial edges for the flowchart (connections between nodes).
* Each edge has an id, source node, target node, and type.
*/

import { Edge } from '@xyflow/react';

export const initialEdges: Edge[] = [
  { id: 'pc-to-memory',  source: 'pcsvg', target: 'instructionMemory', type: 'animatedSvg', animated: true,
  },
];
