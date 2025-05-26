import { Edge  } from '@xyflow/react';
import { ALU_WB } from './ALU_WB';

export const IE_WB: Edge[] = [
    ...ALU_WB, // This file contains the connection between the ALU and the WB
]
