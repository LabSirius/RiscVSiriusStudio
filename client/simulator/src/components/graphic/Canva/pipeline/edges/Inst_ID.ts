import { Edge, MarkerType } from "@xyflow/react";

export const Inst_ID: Edge[] = [
  {
    id: "instructionMemory->inst_id",
    source: "instructionMemory",
    target: "inst_id",
    type: "step",
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: "#888888",
      width: 8,
      height: 8,
    },
  },

  { id: "inst_id->pivot3", source: "inst_id", target: "pivot3", type: "step" },
];
