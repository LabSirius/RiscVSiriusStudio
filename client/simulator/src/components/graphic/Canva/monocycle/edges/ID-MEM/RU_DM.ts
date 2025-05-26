// this file contains the edges for the ID-MEM section of the simulator (instruction memory and data memory)

import { Edge } from "@xyflow/react";

export const RU_DM: Edge[] = [
  {
    id: "pivot5->pivot6",
    source: "pivot5",
    target: "pivot6",
    type: "default",
  },
];
