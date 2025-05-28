import { Edge, MarkerType } from "@xyflow/react";

export const PC_IE: Edge[] = [
  {
    id: "pc_id->pc_ie",
    source: "pc_id",
    target: "pc_ie",
    type: "step",
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: "#888888",
      width: 8,
      height: 8,
    },
  },

  { id: "pc_ie->pivotJump2", source: "pc_ie", target: "pivotJump2", type: "step" },
];
