// this file contains the edges for the IMMGENERATOR_MUX2_1B component

import { Edge } from "@xyflow/react";

export const IG_MUXB: Edge[] = [
  {
    id: "immGenerator->pivotJump5",
    source: "immGenerator",
    target: "pivotJump5",
    type: "smoothstep",
  }
];
