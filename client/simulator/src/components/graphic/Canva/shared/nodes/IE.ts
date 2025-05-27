import { useSimulator } from "@/context/shared/SimulatorContext";
import { Node } from "@xyflow/react";
import { nodeBase, pivotNode } from "./sharedAttributes";

export const useIENodes = (): Node[] => {
  const { typeSimulator } = useSimulator();
  const offsetX = typeSimulator === "pipeline" ? 300 : 0;

  return [
    {
      id: "IE",
      type: "group",
      data: { label: "Section 3" },
      position: { x: 870 + 730 + offsetX, y: 0 },
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

    nodeBase("title-IE", "title", "Execute (IE)", { x: 0, y: 0 }, "IE", 680, 50),
    nodeBase("muxA", "muxA", "MUX A", { x: 165, y: 605 }, "IE", 65, 150),
    nodeBase("aluASrc", "aluASrc", "ALU A SRC", { x: 153, y: 535 }, "IE", 90, 30),
    nodeBase("muxB", "muxB", "MUX B", { x: 165, y: 780 }, "IE", 65, 150),
    nodeBase("aluBSrc", "aluBSrc", "ALU B SRC", { x: 153, y: 982 }, "IE", 90, 30),
    nodeBase("alu", "alu", "ALU", { x: 300, y: 635 }, "IE", 325, 320),
    nodeBase("aluOp", "aluOp", "ALU OPERATION", { x: 410, y: 1000 }, "IE", 105, 30),
    nodeBase("branchUnit", "branchUnit", "Branch Unit", { x: 300, y: 295 }, "IE", 325, 160),
    nodeBase("brOp", "brOp", "BrOp", { x: 418, y: 510 }, "IE", 90, 30),

    pivotNode("pivot4", { x: 45, y: 711 }, "IE"),
    pivotNode("pivot10", { x: 44, y: 1008 }, "IE"),
    nodeBase("pivotJump3", "pivotJump3", "pivotJump3", { x: 29, y: 563 }, "IE", 47, 47),
  ];
};
