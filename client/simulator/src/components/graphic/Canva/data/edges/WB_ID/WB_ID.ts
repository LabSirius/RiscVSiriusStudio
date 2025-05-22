import { Edge, MarkerType  } from '@xyflow/react';


export const WB_ID: Edge[] = [
     { id: 'muxC->pivot11',  source: 'muxC', target: 'pivot11', type: 'step' },
     { id: 'pivot11->pivot12',  source: 'pivot11', target: 'pivot12', type: 'step' },

     { id: 'pivot12->registersUnit',  source: 'pivot12', target: 'registersUnit', targetHandle:'dataWr', type: 'step', markerEnd: {
             type: MarkerType.ArrowClosed,
             color: '#888888',
             width: 8,
                height: 8,
          }, }

  
]
