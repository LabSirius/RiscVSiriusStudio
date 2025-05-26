// This file contains the connection between the ALU and the data memory.

import { Edge } from "@xyflow/react";

export const ALU_DM: Edge[] = [
  {
    id: "alu->pivot7",
    source: "alu",
    sourceHandle: "dataMemory",
    target: "pivot7",
    targetHandle: "alu",
    type: "smoothstep",
  },
];
