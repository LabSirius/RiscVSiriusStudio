// This file contains the connections between IM and RU

import { Edge } from "@xyflow/react";

export const IF_WB: Edge[] = [
  //Addr_MuxC connections

  {
    id: "adder4->pivot18",
    source: "adder4",
    target: "pivot18",
    type: "step",
  },

  {
    id: "pivot18->pivotJump8",
    source: "pivot18",
    sourceHandle: "muxC",
    target: "pivotJump8",
    type: "step",
  },

  {
    id: "pivotJump9->pivot13",
    source: "pivotJump9",
    target: "pivot13",
    type: "step",
  },
];
