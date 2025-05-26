// This file contains the connection between the Registers unit and the muxs A and B

import { Edge } from "@xyflow/react";

export const RU_MUXS: Edge[] = [
  {
    id: "registersUnit->pivotJump4",
    source: "registersUnit",
    target: "pivotJump4",
    type: "step",
  },

  {
    id: "registersUnit->pivot2",
    source: "registersUnit",
    sourceHandle: "muxB",
    target: "pivot2",
    type: "smoothstep",
  },
];
