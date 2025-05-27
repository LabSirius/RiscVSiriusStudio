/*
* In this file  we define the initial edges for the pipeline flowchart (connections between nodes).
*/
import { Edge  } from '@xyflow/react';
import { PC_FE } from './PC_FE';
import { Inst_DE } from './Inst_DE';


export const initialEdges: Edge[] = [
   ...PC_FE,
   ...Inst_DE
];
