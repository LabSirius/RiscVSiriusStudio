import { Edge, MarkerType } from "@xyflow/react";

export const CU_MEM: Edge[] = [
  {
    id: "cu_me->cu_me_exit",
    source: "cu_me",
    sourceHandle: "1",
    target: "cu_me_exit",
    type: "step",
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: "#888888",
      width: 8,
      height: 8,
    },
  },

  {
    id: "cu_me->cu_wb",
    source: "cu_me",
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
