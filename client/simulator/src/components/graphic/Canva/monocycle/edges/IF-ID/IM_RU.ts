// This file contains the connections between Instruction memory and Registers unit

import { Edge, MarkerType } from "@xyflow/react";

export const IM_RU: Edge[] = [
  {
    id: "instructionMemory->pivot3",
    source: "instructionMemory",
    target: "pivot3",
    type: "smoothstep",
  },

  {
    id: "pivot22->registersUnit[11:7]",
    source: "pivot22",
    target: "registersUnit",
    targetHandle: "[11:7]",
    type: "step",
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: "#888888",
      width: 9,
      height: 9,
    },
  },
];
