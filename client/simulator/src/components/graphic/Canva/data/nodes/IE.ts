/*
 * this file contains the nodes of the second third of the simulator
 */

import { Node } from "@xyflow/react";

export const IE: Node[] = [
  {
    id: "IE",
    type: "group",
    data: { label: "Section 3" },
    position: { x: 870 + 730, y: 0 },
    draggable: false,
    zIndex: 0,
    style: {
      width: 680,
      height: 1330,
      backgroundColor: "#E3F2FD",
      border: "1px solid #E3F2FD",
      borderRadius: 8,
    },
  },

  {
    id: "title-IE",
    type: "title",
    data: { label: "Execute (IE)" },
    position: { x: 0, y: 0 },
    parentId: "IE",
    extent: "parent",
    draggable: false,
    style: {
      width: 680,
      height: 50,
      backgroundColor: "transparent",
      border: "none",
      borderRadius: 0,
      padding: 0,
      boxShadow: "none",
    },
  },

  {
    id: "muxA",
    type: "muxA",
    data: { label: "MUX A" },
    position: { x: 165, y: 605 },
    parentId: "IE",
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

  {
    id: "aluASrc",
    type: "aluASrc",
    data: { label: "ALU A SRC" },
    position: { x: 153, y: 535 },
    parentId: "IE",
    extent: "parent",
    style: {
      width: 90,
      height: 30,
      backgroundColor: "transparent",
      border: "none",
      borderRadius: 0,
      padding: 0,
      boxShadow: "none",
    },
  },

  {
    id: "muxB",
    type: "muxB",
    data: { label: "MUX B" },
    position: { x: 165, y: 780 },
    parentId: "IE",
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

  {
    id: "aluBSrc",
    type: "aluBSrc",
    data: { label: "ALU B SRC" },
    position: { x: 153, y: 982 },
    parentId: "IE",
    extent: "parent",
    style: {
      width: 90,
      height: 30,
      backgroundColor: "transparent",
      border: "none",
      borderRadius: 0,
      padding: 0,
      boxShadow: "none",
    },
  },

  {
    id: "alu",
    type: "alu",
    data: { label: "ALU" },
    position: { x: 300, y: 590 },
    parentId: "IE",
    extent: "parent",
    style: {
      width: 325,
      height: 360,
      backgroundColor: "transparent",
      border: "none",
      borderRadius: 0,
      padding: 0,
      boxShadow: "none",
    },
  },

  {
    id: "aluOp",
    type: "aluOp",
    data: { label: "ALU OPERATION" },
    position: { x: 410, y: 1000 },
    parentId: "IE",
    extent: "parent",
    style: {
      width: 105,
      height: 30,
      backgroundColor: "transparent",
      border: "none",
      borderRadius: 0,
      padding: 0,
      boxShadow: "none",
    },
  },

  {
    id: "branchUnit",
    type: "branchUnit",
    data: { label: "Branch Unit" },
    position: { x: 300, y: 295 },
    parentId: "IE",
    extent: "parent",
    style: {
      width: 325,
      height: 160,
      backgroundColor: "transparent",
      border: "none",
      borderRadius: 0,
      padding: 0,
      boxShadow: "none",
    },
  },

  {
    id: "brOp",
    type: "brOp",
    data: { label: "BrOp" },
    position: { x: 418, y: 510 },
    parentId: "IE",
    extent: "parent",
    style: {
      width: 90,
      height: 30,
      backgroundColor: "transparent",
      border: "none",
      borderRadius: 0,
      padding: 0,
      boxShadow: "none",
    },
  },

  //PIVOTS S3

  {
    id: "pivot4",
    type: "pivot4",
    data: { label: "" },
    position: { x: 45, y: 711 },
    parentId: "IE",
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
    id: "pivot10",
    type: "pivot10",
    data: { label: "" },
    position: { x: 44, y: 1008 },
    parentId: "IE",
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

  //jump

  {
    id: "pivotJump3",
    type: "pivotJump3",
    data: { label: "pivotJump3" },
    position: { x: 29, y: 563 },
    parentId: "IE",
    extent: "parent",
    style: {
      width: 47,
      height: 47,
      backgroundColor: "transparent",
      border: "none",
      borderRadius: 0,
      padding: 0,
      boxShadow: "none",
    },
  },
];
