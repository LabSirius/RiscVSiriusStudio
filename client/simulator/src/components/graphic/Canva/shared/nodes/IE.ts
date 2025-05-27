import { useSimulator } from "@/context/shared/SimulatorContext";
import { Node } from "@xyflow/react";
import { nodeBase, pivotNode } from "./sharedAttributes";

export const useIENodes = (): Node[] => {
  const { typeSimulator } = useSimulator();
  const isPipeline = typeSimulator === "pipeline";

  const shift = (x: number): number => x + (isPipeline ? 140 : 0);
  const shiftBack = (x: number): number => x + (isPipeline ? 100 : 0);
  const shiftBackJump = (x: number): number => x + (isPipeline ? 89 : 0);

  const offsetXSize = isPipeline ? 300 : 0;

  const nodes: Node[] = [
    {
      id: "IE",
      type: "group",
      data: { label: "Section 3" },
      position: { x: 870 + 730 + (isPipeline ? 60 : 0), y: 0 },
      draggable: false,
      zIndex: 0,
      style: {
        width: 680 + offsetXSize,
        height: 1330,
        backgroundColor: "#E3F2FD",
        border: "1px solid #E3F2FD",
        borderRadius: 8,
      },
    },

    nodeBase("title-IE", "title", "Execute (IE)", { x: 0, y: 0 }, "IE", 680, 50),
    nodeBase("muxA", "muxA", "MUX A", { x: shift(165), y: 605 }, "IE", 65, 150),
    nodeBase("aluASrc", "aluASrc", "ALU A SRC", { x: shift(153), y: 535 }, "IE", 90, 30),
    nodeBase("muxB", "muxB", "MUX B", { x: shift(165), y: 780 }, "IE", 65, 150),
    nodeBase("aluBSrc", "aluBSrc", "ALU B SRC", { x: shift(153), y: 982 }, "IE", 90, 30),
    nodeBase("alu", "alu", "ALU", { x: shift(300), y: 635 }, "IE", 325, 320),
    nodeBase("aluOp", "aluOp", "ALU OPERATION", { x: shift(410), y: 1000 }, "IE", 105, 30),
    nodeBase("branchUnit", "branchUnit", "Branch Unit", { x: shift(300), y: 295 }, "IE", 325, 160),
    nodeBase("brOp", "brOp", "BrOp", { x: shift(418), y: 510 }, "IE", 90, 30),

    pivotNode("pivot4", { x: shift(45), y: 711 }, "IE"),
    pivotNode("pivot10", { x: shift(44), y: 1008 }, "IE"),
    nodeBase("pivotJump3", "pivotJump3", "pivotJump3", { x: shift(29), y: 563 }, "IE", 47, 47),
  ];

  if (isPipeline) {
    nodes.push(
      pivotNode("pivot2", { x: shiftBack(5), y: 822.3 }, "IE"),
      pivotNode("pivot5", { x: shiftBack(5), y: 1077 }, "IE", "red"),
      nodeBase("pivotJump2", "pivotJump2", "pivotJump2", { x: shiftBackJump(0), y: 363 }, "IE", 47, 47),
      nodeBase("pivotJump4", "pivotJump4", "pivotJump4", { x: shiftBackJump(0), y: 688 }, "IE", 47, 47),
      nodeBase("pivotJump5", "pivotJump5", "pivotJump5", { x: shiftBackJump(0), y: 985 }, "IE", 47, 47),

      pivotNode("pivot14", { x: 800, y: 178 }, "IE"),
pivotNode("pivot7", { x: 860, y: 792.6 }, "IE"),
pivotNode("pivot16", { x: 860, y: 78 }, "IE"),
nodeBase("pivotJump8", "pivotJump8", "pivotJump8", { x: 784, y: 231 }, "IE", 47, 47),
nodeBase("pivotJump9", "pivotJump9", "pivotJump9", { x: 842, y: 231 }, "IE", 47, 47),

    );
  }

  return nodes;
};
