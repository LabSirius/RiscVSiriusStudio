import { Edge, MarkerType } from "@xyflow/react";

export const CU_MEM: Edge[] = [
  {
    id: "cu_mem->cu_mem_exit",
    source: "cu_mem",
    sourceHandle: "1",
    target: "cu_mem_exit",
    type: "step",
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: "#888888",
      width: 8,
      height: 8,
    },
  },

  {
    id: "cu_mem->cu_wb",
    source: "cu_mem",
    sourceHandle: "2",
    target: "cu_wb",
    type: "step",
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: "#888888",
      width: 8,
      height: 8,
    },
  },
];
