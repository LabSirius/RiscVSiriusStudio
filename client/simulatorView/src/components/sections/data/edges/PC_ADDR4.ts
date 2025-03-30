// this file contains the edges for the PC_ADDR4 component AND FOUR_ADDR4 component

import { Edge, MarkerType } from '@xyflow/react';

export const PC_ADDR4: Edge[] = [
<<<<<<< HEAD

  { id: 'pc->pcPivotAdder4', source: 'pc', target: 'pcPivotAdder4', type: 'smoothstep', animated: true },
  {
    id: 'pcPivotAdder4->adder4', source: 'pcPivotAdder4', target: 'adder4', targetHandle: 'pivot', type: 'smoothstep', animated: true, markerEnd:
    {
      type: MarkerType.ArrowClosed,
      width: 18,
      height: 18,
      color: '#FF0072',
    }
  },

  {
    id: 'four->adder4', source: 'four', target: 'adder4', targetHandle: 'fourTarget', type: 'smoothstep', animated: true, markerEnd:
    {
      type: MarkerType.ArrowClosed,
      width: 18,
      height: 18,
      color: '#FF0072',
    },
  },
=======
   
     { id: 'pc->pivot1',  source: 'pc', target: 'pivot1', type: 'smoothstep', animated: true},
     { id: 'pivot1->adder4',  source: 'pivot1', target: 'adder4', targetHandle: 'pivot', type: 'smoothstep', animated: true,  markerEnd:
       {
         type: MarkerType.ArrowClosed,
         width: 18,
         height: 18,
         color: '#FF0072',
       }
     },


     { id: 'four->adder4',  source: 'four', target: 'adder4', targetHandle: 'fourTarget', type: 'smoothstep', animated: true,  markerEnd:
      {
        type: MarkerType.ArrowClosed,
        width: 18,
        height: 18,
        color: '#FF0072',
      },
    },

     
>>>>>>> 253534b (The logic of component names is changed before adding more pivots.)
];
