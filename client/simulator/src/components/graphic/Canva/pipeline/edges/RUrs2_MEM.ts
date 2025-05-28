import { Edge, MarkerType } from "@xyflow/react";

export const RUrs2_MEM: Edge[] = [
  {
    id: "pivot5->rurs2_mem",
    source: "pivot5",
    target: "rurs2_mem",
    type: "step",
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: "#888888",
      width: 8,
      height: 8,
    },
  },

  { id: "rurs2_mem->pivot6", source: "rurs2_mem", target: "pivot6", type: "step" },

  
];
