import { Edge  } from '@xyflow/react';


import { IM_CU } from './IM_CU';
import { IM_RU } from './IM_RU';
import { IM_IG } from './IM_IG';

export const IF_ID: Edge[] = [
  ...IM_CU, // Instruction Memory to Control Unit connection
  ...IM_RU, // Instruction Memory to Register Unit connection
  ...IM_IG, // Instruction Memory to Immediate Generator connection

]
