/*
* In this file  we define the initial edges for the pipeline flowchart (connections between nodes).
*/
import { Edge  } from '@xyflow/react';
import { PC_FE } from './PC_FE';
import { Inst_DE } from './Inst_DE';
import { PC_DE } from './PC_DE';
import { PC_EX } from './PC_EX';


export const initialEdges: Edge[] = [
   ...PC_FE,
   ...Inst_DE,

   ...PC_DE,
   ...PC_EX,
];
