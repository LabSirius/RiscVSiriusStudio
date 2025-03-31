/*
* In this file  we define the initial edges for the flowchart (connections between nodes).
* Each edge has an id, source node, target node, and type.
*/

import { Edge } from '@xyflow/react';
import { IM_RU } from './IM_RU';
import { IM_CU } from './IM_CU';
import { PC_ADDR4 } from './PC_ADDR4';
import { PC_IM } from './PC_IM';
import { IM_IG } from './IM_IG';
import { RU_MUXS } from './RU_MUXS';
import { IG_MUXB } from './IG_MUXB';
import { ALUXSRC } from './ALUXSRC';
import { PC_MUXA } from './PC_MUXA';
import { MUXS_ALU } from './MUXS_ALU';
import { ALUOp_ALU } from './ALUOp_ALU';
import { RU_BU } from './RU_BU';
import { BrOp_BU } from './BrOp_BU';

export const initialEdges: Edge[] = [

  ...PC_ADDR4, //PC to Adder 4 connection and Four to Adder 4 connection
  ...PC_IM, // PC to Instruction Memory connection
  ...IM_RU,  // Instruction Memory to Register Unit connections
  ...IM_CU, // Instruction Memory to Control Unit connections

  ...IM_IG, // Instruction Memory to Immediate Generator connection

  ...RU_MUXS, // Register Unit to MUXS connections
  ...IG_MUXB, // Immediate Generator to MUXB connections and ImmSrc to ImmGen connections

  ...ALUXSRC, // ALU Source to MUX 2_1 A connections and ALU  Source to MUX 2_1 B connections 

  ...PC_MUXA, // PC to MUX 2_1 A connections
  ...MUXS_ALU, // MUXS to ALU connections

  ...ALUOp_ALU, // ALUOp to ALU connection

  ...RU_BU, // Register Unit to Branch Unit connections
  ...BrOp_BU // Branch operation to Branch Unit connections
];
