/*
* In this file  we define the initial edges for the flowchart (connections between nodes).
* Each edge has an id, source node, target node, and type.
*/

import { Edge  } from '@xyflow/react';
import { IM_RU } from './IM_RU';
import { IM_CU } from './IM_CU';
import { PC_ADDR4 } from './PC_ADDR4';
import { PC_IM } from './PC_IM';
import { IM_IG } from './IM_IG';
import { RU_MUX2 } from './RU_MUX2_1';
import { IG_MUX2_1B } from './IG_MUX2_1B';
import { ALUXSRC } from './ALUXSRC';
import { Pv_MUX2_1A } from './Pv_MUX2_1A';


export const initialEdges: Edge[] = [

  ...PC_ADDR4, // PC to Instruction Memory to Adder 4 connections, and PC to Adder 4 connections
  ...PC_IM, // PC to Instruction Memory connections
  ...IM_RU,  // Instruction Memory to Register Unit connections
  ...IM_CU, // Instruction Memory to Control Unit connections

  ...IM_IG, // Instruction Memory to Immediate Generator connections

  ...RU_MUX2, // Register Unit to MUX 2 connections
  ...IG_MUX2_1B, // Immediate Generator to MUX 2 connections and ImmSrc to ImmGen connections

  ...ALUXSRC, // ALU Source to MUX 2_1 A connections and ALU  Source to MUX 2_1 B connections in MUXS
  ...Pv_MUX2_1A, // PC_ADDR4 to MUX 2_1 A connections and PC_ADDR4 to MUX 2_1 B connections in MUXS
];
