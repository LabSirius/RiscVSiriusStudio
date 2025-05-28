import { Edge, MarkerType } from "@xyflow/react";

export const RUrs1_IE: Edge[] = [
  {
    id: "registersUnit->rurs1_ie",
    source: "registersUnit",
    sourceHandle: "muxA",
    target: "rurs1_ie",
    type: "step",
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: "#888888",
      width: 8,
      height: 8,
    },
  },
  { id: "rurs1_ie->pivotJump4", source: "rurs1_ie", target: "pivotJump4", type: "step" },
];
