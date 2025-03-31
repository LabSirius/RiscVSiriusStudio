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
import { RU_MUXS } from './RU_MUXS';
import { IG_MUXB } from './IG_MUXB';
import { ALUXSRC } from './ALUXSRC';
import { MUXS_ALU } from './MUXS_ALU';
import { ALUOp_ALU } from './ALUOp_ALU';
import { RU_BU } from './RU_BU';
import { BrOp_BU } from './BrOp_BU';



export const initialEdges: Edge[] = [


  ...IF, // IF stage edges
  ...ID, // ID stage edges
  ...IF_ID, // IF-ID stage edges
  ...IF_IE, // IF-IE stage edges
  
  ...PC_IM, // PC to Instruction Memory connection


  ...RU_MUXS, // Register Unit to MUXS connections
  ...IG_MUXB, // Immediate Generator to MUXB connections and ImmSrc to ImmGen connections

  ...ALUXSRC, // ALU Source to MUX 2_1 A connections and ALU  Source to MUX 2_1 B connections 

  ...MUXS_ALU, // MUXS to ALU connections

  ...ALUOp_ALU, // ALUOp to ALU connection

  ...RU_BU, // Register Unit to Branch Unit connections
  ...BrOp_BU // Branch operation to Branch Unit connections
];
