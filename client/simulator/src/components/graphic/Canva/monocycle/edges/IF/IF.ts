import { Edge  } from '@xyflow/react';

import { MUXD_PC } from "./MUXD_PC"


export const IF: Edge[] = [
  ...MUXD_PC, // PC to Instruction Memory connection
]
