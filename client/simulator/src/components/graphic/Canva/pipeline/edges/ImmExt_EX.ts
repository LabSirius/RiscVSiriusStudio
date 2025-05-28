import { Edge, MarkerType } from "@xyflow/react";

export const ImmExt_EX: Edge[] = [

     { id: 'immGenerator->immext_ex',  source: 'immGenerator',  target: 'immext_ex', type: 'step', markerEnd:
        {
         type: MarkerType.ArrowClosed,
         color: '#888888',
         width: 8,
        height: 8,
       },
     },

  { id: "immext_ex->pivotJump5", source: "immext_ex", target: "pivotJump5", type: "step" },



];
