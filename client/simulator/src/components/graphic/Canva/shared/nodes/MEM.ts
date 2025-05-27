/*
 * This file defines the nodes for the fourth section (MEM - Memory) of the simulator.
 * It dynamically offsets the entire section depending on the selected simulator type.
 */

import { useSimulator } from "@/context/shared/SimulatorContext";
import { Node } from "@xyflow/react";
import { nodeBase, pivotNode } from "./sharedAttributes";

export const useMEMNodes = (): Node[] => {
  const { typeSimulator } = useSimulator();
  const offsetX = typeSimulator === "pipeline" ? 300 : 0;

  return [
    nodeBase("MEM", "group", "Section 4", { x: 870 + 730 + 680 + offsetX, y: 0 }, "", 565, 1330, "#E8F5E9", {
      zIndex: 0,
      border: "1px solid #E8F5E9",
    }),

    nodeBase("title-MEM", "title", "Memory (MEM)", { x: 0, y: 0 }, "MEM", 565, 50),

    nodeBase("dataMemory", "dataMemory", "Data Memory", { x: 200, y: 635 }, "MEM", 325, 320),
    nodeBase("dmWr", "dmWr", "DMWR", { x: 243, y: 555 }, "MEM", 90, 30),
    nodeBase("dmCtrl", "dmCtrl", "DMCtrl", { x: 385, y: 555 }, "MEM", 90, 30),

    pivotNode("pivot6", { x: 135, y: 1077 }, "MEM"),
    pivotNode("pivot7", { x: 90, y: 792.6 }, "MEM"),
    pivotNode("pivot8", { x: 90, y: 1006 }, "MEM"),
    pivotNode("pivot14", { x: 18, y: 178 }, "MEM"),
    pivotNode("pivot16", { x: 90, y: 78 }, "MEM"),

    nodeBase("pivotJump6", "pivotJump6", "pivotJump6", { x: 118, y: 983 }, "MEM", 47, 47),
    nodeBase("pivotJump8", "pivotJump8", "pivotJump8", { x: 2, y: 231 }, "MEM", 47, 47),
    nodeBase("pivotJump9", "pivotJump9", "pivotJump9", { x: 74, y: 231 }, "MEM", 47, 47),
  ];
};
