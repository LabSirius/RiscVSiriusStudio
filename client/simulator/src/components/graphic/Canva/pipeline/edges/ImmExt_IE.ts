import { Edge, MarkerType } from "@xyflow/react";

export const ImmExt_IE: Edge[] = [

     { id: 'immGenerator->immext_ie',  source: 'immGenerator',  target: 'immext_ie', type: 'step', markerEnd:
        {
         type: MarkerType.ArrowClosed,
         color: '#888888',
         width: 8,
        height: 8,
       },
     },

  { id: "immext_ie->pivotJump5", source: "immext_ie", target: "pivotJump5", type: "step" },



];
