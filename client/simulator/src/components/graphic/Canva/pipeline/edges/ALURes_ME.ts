import { Edge, MarkerType } from "@xyflow/react";

export const ALURes_ME: Edge[] = [
  {
    id: "pivot7->alures_me",
    source: "pivot7",
    sourceHandle: 'dataMemory',
    target: "alures_me",
    type: "step",
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: "#888888",
      width: 8,
      height: 8,
    },
  },

];
