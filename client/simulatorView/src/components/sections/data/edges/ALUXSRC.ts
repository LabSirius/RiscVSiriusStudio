// 

import { Edge, MarkerType  } from '@xyflow/react';

export const ALUXSRC: Edge[] = [
      { id: 'aluASrc->mux2_1A',  source: 'aluASrc', target: 'mux2_1A', targetHandle: 'aluASrc', type: 'smoothstep', animated: true,  markerEnd:
      {
            type: MarkerType.ArrowClosed,
            width: 18,
            height: 18,
            color: '#FF0072',
      },
    },
    { id: 'aluBSrc->mux2_1B',  source: 'aluBSrc', target: 'mux2_1B', targetHandle: 'aluBSrc', type: 'smoothstep', animated: true,  markerEnd:
      {
            type: MarkerType.ArrowClosed,
            width: 18,
            height: 18,
            color: '#FF0072',
      },
    },
  
];
