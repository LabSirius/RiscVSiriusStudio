import { useSimulator } from "@/context/shared/SimulatorContext";
import { Node } from "@xyflow/react";
import { nodeBase, pivotNode } from "./sharedAttributes";

export const useIDNodes = (): Node[] => {
  const { typeSimulator } = useSimulator();
  const offsetX = typeSimulator === "pipeline" ? 300 : 0;

  return [
    {
      id: "ID",
      type: "group",
      data: { label: "Section 2" },
      position: { x: 870 + offsetX, y: 0 },
      draggable: false,
      zIndex: 0,
      style: {
        width: 740,
        height: 1330,
        backgroundColor: "#FFF9C4",
        border: "1px solid #FFF9C4",
        borderRadius: 8,
      },
    },

    nodeBase("title-ID", "title", "Decode (ID)", { x: 0, y: 0 }, "ID", 740, 50),
    nodeBase("ruWr", "ruWr", "RUWR", { x: 120, y: 814 }, "ID", 90, 30),
    nodeBase("registersUnit", "registerUnit", "Registers Unit", { x: 255, y: 435 }, "ID", 360, 450),
    nodeBase("immSrc", "immSrc", "IMMSrc", { x: 145, y: 1028.5 }, "ID", 90, 30),
    nodeBase("immGenerator", "immGenerator", "Immediate Generator", { x: 285, y: 935.5 }, "ID", 330, 150),

    pivotNode("pivot2", { x: 680, y: 822.3 }, "ID"),
    pivotNode("pivot3", { x: 50, y: 843 }, "ID"),
    pivotNode("pivot5", { x: 680, y: 1077 }, "ID", "red"),
    pivotNode("pivot12", { x: 100, y: 1131 }, "ID"),
    pivotNode("pivot18", { x: 50, y: 254 }, "ID"),
    pivotNode("pivot19", { x: 50, y: 128 }, "ID"),
    pivotNode("pivot20", { x: 50, y: 563 }, "ID"),
    pivotNode("pivot21", { x: 50, y: 483 }, "ID"),
    pivotNode("pivot22", { x: 50, y: 643 }, "ID"),
    pivotNode("pivot26", { x: 50, y: 976.5 }, "ID"),
    pivotNode("pivot27", { x: 50, y: 1169 }, "ID"),
    pivotNode("pivot28", { x: 100, y: 1169 }, "ID"),
    pivotNode("pivot29", { x: 100, y: 1210 }, "ID"),
    pivotNode("pivot30", { x: 270, y: 1169 }, "ID"),
    pivotNode("pivot31", { x: 270, y: 1210 }, "ID"),
    pivotNode("pivot32", { x: 450, y: 1169 }, "ID"),
    pivotNode("pivot33", { x: 450, y: 1210 }, "ID"),

    nodeBase("pivotJump1", "pivotJump1", "pivotJump1", { x: 84, y: 953.4 }, "ID", 47, 47),
    nodeBase("pivotJump2", "pivotJump2", "pivotJump2", { x: 664, y: 363 }, "ID", 47, 47),
    nodeBase("pivotJump4", "pivotJump4", "pivotJump4", { x: 664, y: 688 }, "ID", 47, 47),
    nodeBase("pivotJump5", "pivotJump5", "pivotJump5", { x: 664, y: 985 }, "ID", 47, 47),
    nodeBase("pivotJump10", "pivotJump10", "pivotJump10", { x: 34, y: 155 }, "ID", 47, 47),
  ];
};
