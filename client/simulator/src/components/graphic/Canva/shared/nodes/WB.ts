/*
 * This file defines the nodes of the fifth section (WB - Write Back) of the simulator.
 * The entire section is dynamically offset depending on the simulator type.
 */

import { useSimulator } from "@/context/shared/SimulatorContext";
import { Node } from "@xyflow/react";
import { nodeBase, pivotNode } from "./sharedAttributes";

export const useWBNodes = (): Node[] => {
  const { typeSimulator } = useSimulator();
  const offsetX = typeSimulator === "pipeline" ? 700 : 0;

  return [
    nodeBase("WB", "group", "Section 5", { x: 870 + 730 + 680 + 565 + offsetX, y: 0 }, "", 290, 1330, "#FFF2E0", {
      border: "1px solid #FFF2E0",
      zIndex: 0,
    }),

    nodeBase("title-WB", "title", "Write back (WB)", { x: 0, y: 0 }, "WB", 300, 50),

    nodeBase("muxC", "muxC", "MUX C", { x: 90, y: 770 }, "WB", 65, 150),

    nodeBase("ruDataWrSrc", "ruDataWrSrc", "RUDataWrSrc", { x: 78, y: 960 }, "WB", 90, 30),

    pivotNode("pivot9", { x: 18, y: 1006 }, "WB"),
    pivotNode("pivot11", { x: 230, y: 1131 }, "WB"),
    pivotNode("pivot13", { x: 18, y: 254 }, "WB"),
  ];
};
