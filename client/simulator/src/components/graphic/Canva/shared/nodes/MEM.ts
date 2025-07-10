import { useSimulator } from "@/context/shared/SimulatorContext";
import { Node } from "@xyflow/react";
import { nodeBase, pivotNode } from "./sharedAttributes";

export const useMEMNodes = (): Node[] => {
  const { typeSimulator } = useSimulator();
  const isPipeline = typeSimulator === "pipeline";
  const offsetXSize = isPipeline ? 60 : 0;

  const offsetX = isPipeline ? 405 : 0;
  const shift = (x: number): number => x + (isPipeline ? 5 : 0);

  const nodes: Node[] = [
    {
      id: "MEM",
      type: "group",
      data: { label: "Section 4" },
      position: { x: 870 + 730 + 680 + offsetX, y: 0 },
      draggable: false,
      zIndex: 0,
      style: {
        width: 565 + offsetXSize,
        height: 1330 + (isPipeline ? 140 : 0),
        backgroundColor: "#E8F5E9",
        border: "1px solid #E8F5E9",
      },
    },

    nodeBase("title-MEM", "title", "Memory (MEM)", { x: 10, y: 0 }, "MEM", 565, 50),
    nodeBase("dataMemory", "dataMemory", "Data Memory", { x: shift(200), y: 635 }, "MEM", 325, 320),
    nodeBase("dmWr", "dmWr", "DMWR", { x: shift(243), y: 555 }, "MEM", 90, 30),
    nodeBase("dmCtrl", "dmCtrl", "DMCtrl", { x: shift(385), y: 555 }, "MEM", 90, 30),

    pivotNode("pivot6", { x: shift(135), y: 1077 }, "MEM"),
    pivotNode("pivot8", { x: shift(90), y: 1006 }, "MEM"),
    nodeBase("pivotJump6", "pivotJump6", "pivotJump6", { x: shift(118), y: 983 }, "MEM", 47, 47),
    ...(isPipeline
      ? [
          nodeBase(
            "pcinc_wb",
            "pcinc_wb",
            "pcinc_wb",
            { x: 565 + offsetXSize, y: 232.4 },
            "MEM",
            36,
            50
          ),
          nodeBase(
            "dmdatard_wb",
            "dmdatard_wb",
            "dmdatard_wb",
            { x: 565 + offsetXSize, y: 820.8 },
            "MEM",
            36,
            50
          ),
          nodeBase(
            "alures_wb",
            "alures_wb",
            "alures_wb",
            { x: 565 + offsetXSize, y: 986 },
            "MEM",
            36,
            50
          ),
          nodeBase("rd_wb", "rd_wb", "rd_wb", { x: 565 + offsetXSize, y: 1210 }, "MEM", 36, 50),
          nodeBase("cu_wb", "cu_wb", "cu_wb", { x: 565 + offsetXSize, y: 1379.1 }, "MEM", 36, 50),
          pivotNode("pivot34", { x: shift(90), y: 792.3 }, "MEM"),
          nodeBase("cu_mem_exit", "cu_mem_exit", "cu_mem_exit", { x: 100, y: 1272 }, "MEM", 90, 30),
        ]
      : [
          pivotNode("pivot7", { x: shift(90), y: 792.6 }, "MEM"),
          pivotNode("pivot14", { x: shift(18), y: 178 }, "MEM"),
          pivotNode("pivot16", { x: shift(90), y: 78 }, "MEM"),
          nodeBase(
            "pivotJump8",
            "pivotJump8",
            "pivotJump8",
            { x: shift(2), y: 231 },
            "MEM",
            47,
            47
          ),
          nodeBase(
            "pivotJump9",
            "pivotJump9",
            "pivotJump9",
            { x: shift(74), y: 231 },
            "MEM",
            47,
            47
          ),
        ]),
  ];

  return nodes;
};
