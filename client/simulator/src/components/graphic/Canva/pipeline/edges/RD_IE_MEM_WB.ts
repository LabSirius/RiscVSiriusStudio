import { Edge, MarkerType } from "@xyflow/react";

export const RD_IE_MEM_WB: Edge[] = [



  {
    id: "pivot26->pivot38",
    source: "pivot26",
    sourceHandle: 'controlUnit',
    target: "pivot38",
    type: "step",
  },

  {
    id: "pivot38->pivot27",
    source: "pivot38",
    sourceHandle: 'controlUnit',
    target: "pivot27",
    type: "step",
  },

  {
    id: "pivot38->rd_ie",
    source: "pivot38",
    sourceHandle: 'rd_ie',
    target: "rd_ie",
    type: "step",
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: "#888888",
      width: 8,
      height: 8,
    },

  },

  {
    id: "rd_ie->rd_mem",
    source: "rd_ie",
    target: "rd_mem",
    type: "step",
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: "#888888",
      width: 8,
      height: 8,
    },

  },

  {
    id: "rd_mem->rd_wb",
    source: "rd_mem",
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
