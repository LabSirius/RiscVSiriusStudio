import { Edge, MarkerType  } from '@xyflow/react';

export const CU_EX: Edge[] = [
    { id: 'cu_ex->cu_me1',  source: 'cu_ex', sourceHandle:"2", target: 'cu_me', targetHandle:'2', type: 'step', markerEnd:
        {
         type: MarkerType.ArrowClosed,
         color: '#888888',
         width: 8,
        height: 8,
       },
     },

     { id: 'cu_ex->cu_me2',  source: 'cu_ex', sourceHandle:"3", target: 'cu_me', targetHandle:'3', type: 'step', markerEnd:
        {
         type: MarkerType.ArrowClosed,
         color: '#888888',
         width: 8,
        height: 8,
       },
     },
];
