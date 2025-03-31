// This file contains the connection between the ALU and the WB

import { Edge  } from '@xyflow/react';

export const ALU_WB: Edge[] = [
  
  {
    id: 'pivot7->pivot8',  
    source: 'pivot7', 
    sourceHandle: 'wb',
    target: 'pivot8', 
    type: 'smoothstep', 
    animated: true
  },


  {
    id: 'pivot8->pivotJump6',  
    source: 'pivot8', 
    target: 'pivotJump6', 
    type: 'default', 
    animated: true,  
  }

];

