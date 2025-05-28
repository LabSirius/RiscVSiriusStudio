import { Edge, MarkerType } from "@xyflow/react";

export const CU_WB: Edge[] = [
  {
    id: "cu_wb->cu_wb_exit",
    source: "cu_wb",
    target: "cu_wb_exit",
    type: "step",
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: "#888888",
      width: 8,
      height: 8,
    },
  },

  
];
