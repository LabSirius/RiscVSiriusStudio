import { Edge } from "@xyflow/react";

import { IM_RU } from "./IM_RU";
import { IM_IG } from "./IM_IG";
import { IM_CU } from "./IM_CU";

export const IF_ID: Edge[] = [
  ...IM_RU, // Instruction Memory to Register Unit connection
  ...IM_IG,
  ...IM_CU
];
