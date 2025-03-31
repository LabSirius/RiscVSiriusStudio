/*
* In this file  we define the initial edges for the flowchart (connections between nodes).
* Each edge has an id, source node, target node, and type.
*/

import { IF } from './IF/IF';
import { ID } from './ID/ID';
import { IF_ID } from './IF-ID/IF-ID';
import { IF_IE } from './IF-IE/IF-IE';

import { Edge  } from '@xyflow/react';

import { PC_IM } from './IF/PC_IM';
import { ALUXSRC } from './ALUXSRC';
import { MUXS_ALU } from './MUXS_ALU';
import { ALUOp_ALU } from './ALUOp_ALU';
import { BrOp_BU } from './BrOp_BU';
import { ID_IE } from './ID-IE/ID_IE';

export const initialEdges: Edge[] = [


  ...IF, // IF stage edges
  ...ID, // ID stage edges
  ...IF_ID, // IF-ID stage edges
  ...IF_IE, // IF-IE stage edges
  ...ID_IE, // ID-IE stage edges
  
  ...PC_IM, // PC to Instruction Memory connection

  ...ALUXSRC, // ALU Source to MUX 2_1 A connections and ALU  Source to MUX 2_1 B connections 

  ...MUXS_ALU, // MUXS to ALU connections

  ...ALUOp_ALU, // ALUOp to ALU connection
  ...BrOp_BU // Branch operation to Branch Unit connections
];
