// This file contains the connections between Instruction memory and inmmediate generator

import { Edge  } from '@xyflow/react';

export const IM_IG: Edge[] = [
  
     {
      id: 'pivot26->pivotJump1',
       source: 'pivot26',
       sourceHandle: 'immGenerator',
      target: 'pivotJump1',
      type: 'default',
    },
      
];
