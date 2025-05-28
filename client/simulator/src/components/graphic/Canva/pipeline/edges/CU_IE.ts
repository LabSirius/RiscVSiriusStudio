import { Edge, MarkerType  } from '@xyflow/react';

export const CU_IE: Edge[] = [

  { id: 'cu_ie->cu_ie_exit',  source: 'cu_ie', sourceHandle:"1", target: 'cu_ie_exit',  type: 'step', markerEnd:
        {
         type: MarkerType.ArrowClosed,
         color: '#888888',
         width: 8,
        height: 8,
       },
     },


    { id: 'cu_ie->cu_me1',  source: 'cu_ie', sourceHandle:"2", target: 'cu_mem', targetHandle:'2', type: 'step', markerEnd:
        {
         type: MarkerType.ArrowClosed,
         color: '#888888',
         width: 8,
        height: 8,
       },
     },

     { id: 'cu_ie->cu_me2',  source: 'cu_ie', sourceHandle:"3", target: 'cu_mem', targetHandle:'3', type: 'step', markerEnd:
        {
         type: MarkerType.ArrowClosed,
         color: '#888888',
         width: 8,
        height: 8,
       },
     },
];
