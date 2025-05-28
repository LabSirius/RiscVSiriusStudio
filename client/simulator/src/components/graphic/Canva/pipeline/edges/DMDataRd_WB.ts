import { Edge, MarkerType } from "@xyflow/react";

export const DMDataRd_WB: Edge[] = [
  {
    id: "dataMemory->dmdatard_wb",
    source: "dataMemory",
    target: "dmdatard_wb",
    type: "step",
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: "#888888",
      width: 8,
      height: 8,
    },
  },

  {
    id: "dmdatard_wb->muxC",
    source: "dmdatard_wb",
    target: "muxC",
    targetHandle: "dataMemory",
    type: "step",
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: "#888888",
      width: 8,
      height: 8,
    },
  },
];
