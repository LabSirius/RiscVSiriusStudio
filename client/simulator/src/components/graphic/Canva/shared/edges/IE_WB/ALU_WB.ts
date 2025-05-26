// This file contains the connection between the ALU and the WB

import { Edge, MarkerType  } from '@xyflow/react';

export const ALU_WB: Edge[] = [
  
  {
    id: 'pivot7->pivot8',  
    source: 'pivot7', 
    sourceHandle: 'wb',
    target: 'pivot8', 
    type: 'smoothstep', 
  },


  {
    id: 'pivot8->pivotJump6',  
    source: 'pivot8', 
    target: 'pivotJump6', 
    type: 'default', 
  },
  {
    id: 'pivot9->muxC',  
    source: 'pivot9', 
    target: 'muxC', 
    targetHandle: 'alu',
    type: 'smoothstep', 
    markerEnd:
        {
          type: MarkerType.ArrowClosed,
          color: '#888888',
          width: 8,
          height: 8,
        },
  }


];

