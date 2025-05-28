import { Edge, MarkerType } from "@xyflow/react";

export const RUrs2_IE: Edge[] = [
  {
    id: "registersUnit->rurs2_ex",
    source: "registersUnit",
    sourceHandle: "muxB",
    target: "rurs2_ex",
    type: "step",
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: "#888888",
      width: 8,
      height: 8,
    },
  },
  { id: "rurs2_ex->pivot2", source: "rurs2_ex", target: "pivot2", type: "step" },
  
];
