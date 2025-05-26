// This file contains the connection between the PC and the MUXA

import { Edge, MarkerType } from "@xyflow/react";

export const PC_MUXA: Edge[] = [
  { id: "pivotJump2->pivotJump3", source: "pivotJump2", target: "pivotJump3", type: "smoothstep" },

  {
    id: "pivotJump3->muxA",
    source: "pivotJump3",
    target: "muxA",
    targetHandle: "pc",
    type: "smoothstep",
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: "#888888",
      width: 8,
      height: 8,
    },
  },
];
