// This file contains the connection between the PC and the MUXA

import { Edge } from "@xyflow/react";

export const PC_MUXA: Edge[] = [
  {
    id: "pivot1->pivotJump2",
    source: "pivot1",
    target: "pivotJump2",
    sourceHandle: "muxA",
    type: "smoothstep",
  },
];
