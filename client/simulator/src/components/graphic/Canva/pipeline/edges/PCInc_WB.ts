import { Edge, MarkerType } from "@xyflow/react";

export const PCInc_WB: Edge[] = [
  {
    id: "pcinc_mem->pcinc_wb",
    source: "pcinc_mem",
    target: "pcinc_wb",
    type: "step",
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: "#888888",
      width: 8,
      height: 8,
    },
  },

  { id: "pcinc_wb->pivot13", source: "pcinc_wb", target: "pivot13", type: "step" },
];
