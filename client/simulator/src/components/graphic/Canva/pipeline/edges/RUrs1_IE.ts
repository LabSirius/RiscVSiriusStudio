import { Edge, MarkerType } from "@xyflow/react";

export const RUrs1_IE: Edge[] = [
  {
    id: "registersUnit->rurs1_ex",
    source: "registersUnit",
    sourceHandle: "muxA",
    target: "rurs1_ex",
    type: "step",
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: "#888888",
      width: 8,
      height: 8,
    },
  },
  { id: "rurs1_ex->pivotJump4", source: "rurs1_ex", target: "pivotJump4", type: "step" },
];
