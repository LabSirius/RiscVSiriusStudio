import { useSimulator } from "@/context/shared/SimulatorContext";
import { Node } from "@xyflow/react";
import { nodeBase, pivotNode } from "./sharedAttributes";

export const useIFNodes = (): Node[] => {
  const { typeSimulator } = useSimulator();

  const isPipeline = typeSimulator === "pipeline";
  const offsetXSize = isPipeline ? 50 : 0;

  return [
    {
      id: "IF",
      type: "group",
      data: { label: "Section 1" },
      position: { x: 0, y: 0 },
      draggable: false,
      zIndex: 6,
      style: {
        width: 870 + offsetXSize,
        height: 1330,
        backgroundColor: "#FCE4EC",
        border: "1px solid #FCE4EC",
        borderRadius: 8,
      },
    },

    nodeBase("title-IF", "title", "Fetch (IF)", { x: 0, y: 0 }, "IF", 870, 50),
    nodeBase("pc", "pc", "PC", { x: 215 + (isPipeline ? 12 : 0) , y: 685 }, "IF", 180, 239),
    nodeBase("adder4", "adder4", "Adder 4", { x: 595, y: 225 }, "IF", 90, 120),
    nodeBase("four", "four", "4", { x: 465, y: 191 }, "IF", 90, 120),
    nodeBase(
      "instructionMemory",
      "instructionMemory",
      "Instruction Memory",
      { x: 505 + (isPipeline ? 15 : 0), y: 685 },
      "IF",
      290,
      339
    ),
    nodeBase("muxD", "muxD", "MUX D", { x: 93, y: 480 }, "IF", 65, 150),

    pivotNode("pivot1", { x: 435 + (isPipeline ? 15 : 0), y: 386 + (isPipeline ? 30 : 0) }, "IF"),
    pivotNode("pivot15", { x: 225, y: 178 }, "IF"),
    pivotNode("pivot17", { x: 90.7, y: 78 }, "IF"),
    pivotNode("pivot25", { x: 435 + (isPipeline ? 15 : 0), y: 798.9 }, "IF"),

    {
      id: "controlUnit",
      type: "controlUnit",
      data: { label: "controlUnit" },
      position: { x: 40, y: 1180.5 },
      parentId: "IF",
      draggable: false,
      style: {
        width: 3050,
        height: 150,
        backgroundColor: "transparent",
        border: "none",
        borderRadius: 0,
        padding: 0,
        boxShadow: "none",
      },
    },

    ...(isPipeline
  ? [
      nodeBase("pc_fe", "pc_fe", "pc_fe", { x: 90.5, y: 829.5

       }, "IF", 36, 50),
      nodeBase("pcinc_de", "pcinc_de", "pcinc_de", { x:  870 + offsetXSize, y: 235 }, "IF", 36, 50),
      nodeBase("pc_de", "pc_de", "PC_De", { x:  870 + offsetXSize, y: 370 }, "IF", 36, 50),
      nodeBase("inst_de", "inst_de", "inst_de", { x:  870 + offsetXSize, y: 821.4 }, "IF", 36, 50),

    ]
  : []),

  ];
};
