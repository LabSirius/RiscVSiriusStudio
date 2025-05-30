import { useSimulator } from "@/context/shared/SimulatorContext";
import { Node } from "@xyflow/react";
import { nodeBase, pivotNode } from "./sharedAttributes";

export const useIDNodes = (): Node[] => {
  const { typeSimulator } = useSimulator();
  const isPipeline = typeSimulator === "pipeline";
  const offsetXSize = isPipeline ? 80 : 0;
  const shift = (x: number): number => x + (isPipeline ? 35 : 0);

  const nodes: Node[] = [
    {
      id: "ID",
      type: "group",
      data: { label: "Section 2" },
      position: { x: 870 + (isPipeline ? 50 : 0), y: 0 },
      draggable: false,
      zIndex: 5,
      style: {
        width: 740 + offsetXSize,
        height: 1330 + (isPipeline ? 140 : 0),
        backgroundColor: "#FFF9C4",
        border: "1px solid #FFF9C4",
        borderRadius: 8,
      },
    },

    nodeBase("title-ID", "title", "Decode (ID)", { x: 10, y: 0 }, "ID", 740, 50),
    nodeBase(
      "ruWr",
      "ruWr",
      "RUWR",
      { x: shift(120) + (isPipeline ? 70 : 0), y: 814 },
      "ID",
      90,
      30
    ),
    nodeBase(
      "registersUnit",
      "registerUnit",
      "Registers Unit",
      { x: shift(255) + (isPipeline ? 70 : 0), y: 435 },
      "ID",
      360,
      450
    ),
    nodeBase(
      "immSrc",
      "immSrc",
      "IMMSrc",
      { x: shift(145) + (isPipeline ? 70 : 0), y: 1028.5 },
      "ID",
      90,
      30
    ),
    nodeBase(
      "immGenerator",
      "immGenerator",
      "Immediate Generator",
      { x: shift(285) + (isPipeline ? 70 : 0), y: 935.5 },
      "ID",
      330,
      150
    ),

    pivotNode("pivot3", { x: shift(50), y: 843 }, "ID"),
    pivotNode("pivot12", { x: shift(100) + (isPipeline ? 70 : 0), y: 1131 }, "ID"),
    pivotNode("pivot20", { x: shift(50), y: 563 }, "ID"),
    pivotNode("pivot21", { x: shift(50), y: 483 }, "ID"),
    pivotNode("pivot22", { x: shift(50), y: 643 }, "ID"),
    pivotNode("pivot26", { x: shift(50), y: 976.5 }, "ID"),
    pivotNode("pivot27", { x: shift(50), y: 1169 + (isPipeline ? 130 : 0) }, "ID"),
    pivotNode("pivot28", { x: shift(100), y: 1169 + (isPipeline ? 130 : 0) }, "ID"),
    pivotNode("pivot29", { x: shift(100), y: 1210 + (isPipeline ? 130 : 0) }, "ID"),
    pivotNode("pivot30", { x: shift(270), y: 1169 + (isPipeline ? 130 : 0) }, "ID"),
    pivotNode("pivot31", { x: shift(270), y: 1210 + (isPipeline ? 130 : 0) }, "ID"),
    pivotNode("pivot32", { x: shift(450), y: 1169 + (isPipeline ? 130 : 0) }, "ID"),
    pivotNode("pivot33", { x: shift(450), y: 1210 + (isPipeline ? 130 : 0) }, "ID"),

    nodeBase(
      "pivotJump1",
      "pivotJump1",
      "pivotJump1",
      { x: shift(84) + (isPipeline ? 70 : 0), y: 953.4 },
      "ID",
      47,
      47
    ),

    ...(isPipeline
      ? [
          pivotNode("pivot35", { x: 143, y: 643 }, "ID"),
          pivotNode("pivot36", { x: 143, y: 1170 }, "ID"),

          pivotNode("pivot38", { x: 85, y: 1232 }, "ID"),

          nodeBase(
            "pcinc_ie",
            "pcinc_ie",
            "pcinc_ie",
            { x: 740 + offsetXSize, y: 232.4 },
            "ID",
            36,
            50
          ),
          nodeBase("pc_ie", "pc_ie", "PC_ex", { x: 740 + offsetXSize, y: 370 }, "ID", 36, 50),
          nodeBase(
            "rurs1_ie",
            "rurs1_ie",
            "rurs1_ie",
            { x: 740 + offsetXSize, y: 685 },
            "ID",
            36,
            50
          ),
          nodeBase(
            "rurs2_ie",
            "rurs2_ie",
            "rurs2_ie",
            { x: 740 + offsetXSize, y: 804 },
            "ID",
            36,
            50
          ),
          nodeBase(
            "immext_ie",
            "immext_ie",
            "immext_ie",
            { x: 740 + offsetXSize, y: 986.3 },
            "ID",
            36,
            50
          ),
          nodeBase("rd_ie", "rd_ie", "rd_ie", { x: 740 + offsetXSize, y: 1210 }, "ID", 36, 50),
          nodeBase("cu_ie", "cu_ie", "cu_ie", { x: 740 + offsetXSize, y: 1370.3 }, "ID", 36, 50),
          nodeBase("cu_id_exit", "cu_id_exit", "cu_id_exit", { x: 660, y: 1272 }, "ID", 90, 30),
          pivotNode("pivot39", { x: 620, y: 1365 }, "ID"),
          nodeBase(
            "stageSeparatorID_IE",
            "stageSeparatorID_IE",
            "stageSeparatorID_IE",
            { x: 740 + offsetXSize, y: 60 },
            "ID",
            5,
            1385
          ),
          nodeBase(
            "pivotJump11",
            "pivotJump11",
            "pivotJump11",
            { x: shift(21.5) + (isPipeline ? 70 : 0), y: 953.4 },
            "ID",
            47,
            47
          ),
        ]
      : [
          pivotNode("pivot2", { x: shift(680), y: 822.3 }, "ID"),
          pivotNode("pivot5", { x: shift(680), y: 1077 }, "ID", "red"),
          pivotNode("pivot18", { x: shift(50), y: 254 }, "ID"),
          pivotNode("pivot19", { x: shift(50), y: 128 }, "ID"),
          nodeBase(
            "pivotJump2",
            "pivotJump2",
            "pivotJump2",
            { x: shift(664), y: 363 },
            "ID",
            47,
            47
          ),
          nodeBase(
            "pivotJump4",
            "pivotJump4",
            "pivotJump4",
            { x: shift(664), y: 688 },
            "ID",
            47,
            47
          ),
          nodeBase(
            "pivotJump5",
            "pivotJump5",
            "pivotJump5",
            { x: shift(664), y: 985 },
            "ID",
            47,
            47
          ),
          nodeBase(
            "pivotJump10",
            "pivotJump10",
            "pivotJump10",
            { x: shift(34), y: 155 },
            "ID",
            47,
            47
          ),
        ]),
  ];

  return nodes;
};
