import { Edge, MarkerType } from "@xyflow/react";

export const RUrs2_MEM: Edge[] = [
  {
    id: "pivot5->rurs2_me",
    source: "pivot5",
    target: "rurs2_me",
    type: "step",
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: "#888888",
      width: 8,
      height: 8,
    },
  },

  { id: "rurs2_me->pivot6", source: "rurs2_me", target: "pivot6", type: "step" },

  
];
