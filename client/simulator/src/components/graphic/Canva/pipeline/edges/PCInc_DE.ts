import { Edge, MarkerType } from "@xyflow/react";

export const PCInc_DE: Edge[] = [
  {
    id: "adder4->pivot18",
    source: "adder4",
    target: "pivot18",
    type: "step",
  },

  { id: 'pivot18->pcinc_de',  source: 'pivot18', sourceHandle:"muxC", target: 'pcinc_de', type: 'step', markerEnd:
        {
         type: MarkerType.ArrowClosed,
         color: '#888888',
         width: 8,
        height: 8,
       },
     },

     { id: 'pcinc_de->pcinc_ex',  source: 'pcinc_de',  target: 'pcinc_ex', type: 'step', markerEnd:
        {
         type: MarkerType.ArrowClosed,
         color: '#888888',
         width: 8,
        height: 8,
       },
     },


];
