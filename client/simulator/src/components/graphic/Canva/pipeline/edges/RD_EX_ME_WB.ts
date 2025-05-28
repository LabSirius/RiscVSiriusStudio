import { Edge, MarkerType } from "@xyflow/react";

export const RD_EX_ME_WB: Edge[] = [

  {
    id: "rd_ex->rd_me",
    source: "rd_ex",
    target: "rd_me",
    type: "step",
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: "#888888",
      width: 8,
      height: 8,
    },

  },

  {
    id: "rd_me->rd_wb",
    source: "rd_me",
    target: "rd_wb",
    type: "step",
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: "#888888",
      width: 8,
      height: 8,
    },

  },

  {
    id: "rd_wb->pivot37",
    source: "rd_wb",
    target: "pivot37",
    type: "step",

  },
  {
    id: "pivot37->pivot36",
    source: "pivot37",
    target: "pivot36",
    type: "step",

  },
  {
    id: "pivot36->pivot35",
    source: "pivot36",
    target: "pivot35",
    type: "step",

  },

  {
    id: "pivot35->registersUnit[11:7]",
    source: "pivot35",
    target: "registersUnit",
    targetHandle:'[11:7]',
    type: "step",
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: "#888888",
      width: 8,
      height: 8,
    },
  },

];
