import { Edge, MarkerType  } from '@xyflow/react';


export const WB: Edge[] = [
     { id: 'ruDataWrSrc->muxC',  source: 'ruDataWrSrc', target: 'muxC', targetHandle: 'ruDataWrSrc', type: 'step',  markerEnd:
           {
             type: MarkerType.ArrowClosed,
             color: '#888888',
           }
        },
  
]
