import { Edge  } from '@xyflow/react';
import { ALU_DM } from './ALU-DM';

export const IE_MEM: Edge[] = [
  ...ALU_DM, // ALU to Data Memory connection

]
