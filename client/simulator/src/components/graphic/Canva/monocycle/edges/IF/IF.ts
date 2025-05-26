import { Edge  } from '@xyflow/react';

import { PC_IM } from "./PC_IM"
import { MUXD_PC } from './MUXD_PC';

export const IF: Edge[] = [
  ...PC_IM, // PC to Instruction Memory connection
  ...MUXD_PC // MuxD to PC connection
]
