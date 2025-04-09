// this file contains the edges for the ALUASrc AND ALUBSrc source connections in MUXS
import { Edge, MarkerType  } from '@xyflow/react';

export const ALUXSrc: Edge[] = [
      { id: 'aluASrc->muxA',  source: 'aluASrc', target: 'muxA', targetHandle: 'aluASrc', type: 'smoothstep',  markerEnd:
      {
            type: MarkerType.ArrowClosed,
            color: '#888888',
            width: 8,
            height: 8,
      },
    },
    { id: 'aluBSrc->muxB',  source: 'aluBSrc', target: 'muxB', targetHandle: 'aluBSrc', type: 'smoothstep',  markerEnd:
      {
            type: MarkerType.ArrowClosed,
            color: '#888888',
            width: 8,
            height: 8,
      },
    },
  
];
