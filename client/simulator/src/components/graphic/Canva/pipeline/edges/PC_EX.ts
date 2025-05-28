import { Edge, MarkerType } from "@xyflow/react";

export const PC_EX: Edge[] = [
  {
    id: "pc_de->pc_ex",
    source: "pc_de",
    target: "pc_ex",
    type: "step",
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: "#888888",
      width: 8,
      height: 8,
    },
  },

  { id: "pc_ex->pivotJump2", source: "pc_ex", target: "pivotJump2", type: "step" },
];
