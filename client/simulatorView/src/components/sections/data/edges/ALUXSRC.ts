// this file contains the edges for the ALU A AND B source connections in MUXS
import { Edge, MarkerType  } from '@xyflow/react';

export const ALUXSRC: Edge[] = [
      { id: 'aluASrc->muxA',  source: 'aluASrc', target: 'muxA', targetHandle: 'aluASrc', type: 'smoothstep', animated: true,  markerEnd:
      {
            type: MarkerType.ArrowClosed,
            width: 18,
            height: 18,
            color: '#888888',
      },
    },
    { id: 'aluBSrc->muxB',  source: 'aluBSrc', target: 'muxB', targetHandle: 'aluBSrc', type: 'smoothstep', animated: true,  markerEnd:
      {
            type: MarkerType.ArrowClosed,
            width: 18,
            height: 18,
            color: '#888888',
      },
    },
  
];
