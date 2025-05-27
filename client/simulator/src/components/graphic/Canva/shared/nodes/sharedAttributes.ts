// 📁 shared/utils/nodeHelpers.ts

import { Node } from "@xyflow/react";

// 🧱 Reusable base styles
export const transparentStyle = {
  border: "none",
  borderRadius: 0,
  padding: 0,
  boxShadow: "none",
};

export const pivotStyle = {
  width: 5,
  height: 5,
  backgroundColor: "black",
  ...transparentStyle,
};

export const pivotNode = (
  id: string,
  position: { x: number; y: number },
  parentId: string,
  color: string = "black"
): Node => ({
  id,
  type: id,
  data: { label: "" },
  position,
  parentId,
  extent: "parent" as const,
  style: {
    ...pivotStyle,
    backgroundColor: color,
  },
});


export const nodeBase = (
  id: string,
  type: string,
  label: string,
  position: { x: number; y: number },
  parentId: string,
  width: number,
  height: number,
  backgroundColor: string = "transparent",
  styleOverrides: Partial<Node["style"]> = {}
): Node => ({
  id,
  type,
  data: { label },
  position,
  parentId,
  extent: "parent" as const,
  style: {
    backgroundColor,
    width,
    height,
    ...transparentStyle,
    ...styleOverrides,
  },
});
