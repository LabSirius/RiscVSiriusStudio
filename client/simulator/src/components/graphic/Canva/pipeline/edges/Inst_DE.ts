import { Edge, MarkerType } from "@xyflow/react";

export const Inst_DE: Edge[] = [
  {
    id: "instructionMemory->inst_de",
    source: "instructionMemory",
    target: "inst_de",
    type: "step",
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: "#888888",
      width: 8,
      height: 8,
    },
  },

  { id: "inst_de->pivot3", source: "inst_de", target: "pivot3", type: "step" },
];
