// 

import { Edge, MarkerType  } from '@xyflow/react';

export const ALUXSRC: Edge[] = [
      { id: 'aluASrc->muxA',  source: 'aluASrc', target: 'muxA', targetHandle: 'aluASrc', type: 'smoothstep', animated: true,  markerEnd:
      {
            type: MarkerType.ArrowClosed,
            width: 18,
            height: 18,
            color: '#FF0072',
      },
    },
    { id: 'aluBSrc->mux2B',  source: 'aluBSrc', target: 'mux2B', targetHandle: 'aluBSrc', type: 'smoothstep', animated: true,  markerEnd:
      {
            type: MarkerType.ArrowClosed,
            width: 18,
            height: 18,
            color: '#FF0072',
      },
    },
  
];
