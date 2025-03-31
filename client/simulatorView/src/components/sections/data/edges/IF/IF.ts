import { Edge  } from '@xyflow/react';

import { PC_IM } from "./PC_IM"
import { PC_Addr4 } from "./PC_Addr4"
import { four_Addr4 } from "./four_Addr4"

export const IF: Edge[] = [
  ...PC_IM, // PC to Instruction Memory connection
  ...PC_Addr4, // PC to Adder connection
  ...four_Addr4, // Constant 4 to Adder connection
]
