/*
 * this file contains the nodes for section 1 of the simulator view
 *
 */

import { Node } from "@xyflow/react";

export const IF: Node[] = [
  {
    id: "IF",
    type: "group",
    data: { label: "Section 1" },
    position: { x: 0, y: 0 },
    draggable: false,
    zIndex: 1,
    style: {
      width: 870,
      height: 1375,
      backgroundColor: "#FCE4EC",
      border: "1px solid #FCE4EC",
      borderRadius: 8,
    },
  },

  {
    id: "title-IF",
    type: "title",
    data: { label: "Fetch (IF)" },
    position: { x: 0, y: 0 },
    parentId: "IF",
    extent: "parent",
    draggable: false,
    style: {
      width: 870,
      height: 50,
      backgroundColor: "transparent",
      border: "none",
      borderRadius: 0,
      padding: 0,
      boxShadow: "none",
    },
  },

  {
    id: "pc",
    type: "pc",
    data: { label: "PC" },
    position: { x: 215, y: 705 },
    parentId: "IF",
    extent: "parent",
    style: {
      width: 180,
      height: 239,
      backgroundColor: "transparent",
      border: "none",
      borderRadius: 0,
      padding: 0,
      boxShadow: "none",
    },
  },

  {
    id: "adder4",
    type: "adder4",
    data: { label: "Adder 4" },
    position: { x: 595, y: 245 },
    parentId: "IF",
    extent: "parent",
    style: {
      width: 90,
      height: 120,
      backgroundColor: "transparent",
      border: "none",
      borderRadius: 0,
      padding: 0,
      boxShadow: "none",
    },
  },

  {
    id: "four",
    type: "four",
    data: { label: "4" },
    position: { x: 465, y: 211 },
    parentId: "IF",
    extent: "parent",
    style: {
      width: 90,
      height: 120,
      backgroundColor: "transparent",
      border: "none",
      borderRadius: 0,
      padding: 0,
      boxShadow: "none",
    },
  },

  {
    id: "instructionMemory",
    type: "instructionMemory",
    data: { label: "Instruction Memory" },
    position: { x: 505, y: 705 },
    parentId: "IF",
    extent: "parent",
    style: {
      width: 290,
      height: 339,
      backgroundColor: "transparent",
      border: "none",
      borderRadius: 0,
      padding: 0,
      boxShadow: "none",
    },
  },

  {
    id: "muxD",
    type: "muxD",
    data: { label: "MUX D" },
    position: { x: 93, y: 500 },
    parentId: "IF",
    extent: "parent",
    style: {
      width: 65,
      height: 150,
      backgroundColor: "transparent",
      border: "none",
      borderRadius: 0,
      padding: 0,
      boxShadow: "none",
    },
  },

  // PIVOTS S1

  {
    id: "pivot1",
    type: "pivot1",
    data: { label: "" },
    position: { x: 435, y: 406 },
    parentId: "IF",
    extent: "parent",
    style: {
      width: 5,
      height: 5,
      backgroundColor: "black",
      border: "none",
      borderRadius: 0,
      padding: 0,
      boxShadow: "none",
    },
  },

  {
    id: "pivot15",
    type: "pivot15",
    data: { label: "" },
    position: { x: 225, y: 198 },
    parentId: "IF",
    extent: "parent",
    style: {
      width: 5,
      height: 5,
      backgroundColor: "black",
      border: "none",
      borderRadius: 0,
      padding: 0,
      boxShadow: "none",
    },
  },

  {
    id: "pivot17",
    type: "pivot17",
    data: { label: "" },
    position: { x: 90.7, y: 98 },
    parentId: "IF",
    extent: "parent",
    style: {
      width: 5,
      height: 5,
      backgroundColor: "black",
      border: "none",
      borderRadius: 0,
      padding: 0,
      boxShadow: "none",
    },
  },

  {
    id: "pivot25",
    type: "pivot25",
    data: { label: "" },
    position: { x: 435, y: 818.9 },
    parentId: "IF",
    extent: "parent",
    style: {
      width: 5,
      height: 5,
      backgroundColor: "black",
      border: "none",
      borderRadius: 0,
      padding: 0,
      boxShadow: "none",
    },
  },
];
