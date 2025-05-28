import { useSimulator } from "@/context/shared/SimulatorContext";
import { Node } from "@xyflow/react";
import { nodeBase, pivotNode } from "./sharedAttributes";

export const useWBNodes = (): Node[] => {
  const { typeSimulator } = useSimulator();
  const isPipeline = typeSimulator === "pipeline";

  const offsetX = isPipeline ? 465 : 0;
  const shift = (x: number): number => x + (isPipeline ? 90 : 0);

  const nodes: Node[] = [
    {
      id: "WB",
      type: "group",
      data: { label: "Section 5" },
      position: { x: 870 + 730 + 680 + 565 + offsetX, y: 0 },
      draggable: false,
      zIndex: -1,
      style: {
        width: 290 + (isPipeline ? 80 : 0),
        height: 1330 + (isPipeline ? 140 : 0),
        backgroundColor: "#FFF2E0",
        border: "1px solid #FFF2E0",
        borderRadius: 8,
      },
    },

    nodeBase("title-WB", "title", "Write back (WB)", { x: 10, y: 0 }, "WB", 300, 50),

    nodeBase("muxC", "muxC", "MUXC", { x: shift(90), y: 770 }, "WB", 65, 150),

    nodeBase("ruDataWrSrc", "ruDataWrSrc", "RUDataWrSrc", { x: shift(78), y: 960 }, "WB", 90, 30),

    pivotNode("pivot9", { x: shift(18), y: 1006 }, "WB"),
    pivotNode("pivot11", { x: shift(230), y: 1131 }, "WB"),
    pivotNode("pivot13", { x: shift(18), y: 254 }, "WB"),
  ];

  if (isPipeline) {
    nodes.push(pivotNode("pivot37", { x: shift(18), y: 1170 }, "WB"));
  }

  return nodes;
};
