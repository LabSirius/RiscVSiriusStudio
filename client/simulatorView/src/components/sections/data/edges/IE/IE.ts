import { Edge  } from '@xyflow/react';
import { ALUOp_ALU } from './ALUOp_ALU';
import { brOp_BU } from './brOp_BU';
import { ALUXSrc } from './ALUXSrc_ALU';
import { MUXS_ALU } from './MUXS_ALU';

export const IE: Edge[] = [
  ...ALUOp_ALU, // ALUOp to ALU connection
  ...brOp_BU, // Branch operation to Branch Unit connections
  ...ALUXSrc, // ALU Source to MUX 2_1 A connections and ALU  Source to MUX 2_1 B connections
  ...MUXS_ALU, // MUXS to ALU connections
]
