import { Edge, MarkerType } from "@xyflow/react";

export const ALURes_WB: Edge[] = [
  {
    id: "pivotJump6->alures_wb",
    source: "pivotJump6",
    target: "alures_wb",
    type: "step",
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: "#888888",
      width: 8,
      height: 8,
    },
  },

  { id: "alures_wb->pivot9", source: "alures_wb", target: "pivot9", type: "step" },
];
