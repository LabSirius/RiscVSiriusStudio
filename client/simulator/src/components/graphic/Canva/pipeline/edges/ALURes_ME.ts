import { Edge, MarkerType } from "@xyflow/react";

export const ALURes_ME: Edge[] = [
  {
    id: "pivot7->alures_me",
    source: "pivot7",
    sourceHandle: "dataMemory",
    target: "alures_me",
    type: "step",
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: "#888888",
      width: 8,
      height: 8,
    },
  },

  { id: "alures_me->pivot34", source: "alures_me", target: "pivot34", type: "step" },

  {
    id: "pivot34->pivot8",
    source: "pivot34",
    sourceHandle: "alures_wb",
    target: "pivot8",
    type: "step",
  },

  {
    id: "pivot34->dataMemory",
    source: "pivot34",
    sourceHandle: "dataMemory",
    target: "dataMemory",
    targetHandle: "alu",
    type: "step",
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: "#888888",
      width: 8,
      height: 8,
    },
  },
];
