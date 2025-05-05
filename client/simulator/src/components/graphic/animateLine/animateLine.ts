import { Edge } from "@xyflow/react";

const pivotJumpGroup = [
  "pc->pivot25",
  "pivot25->pivot1",
  "pivot1->pivotJump1",
  "pivotJump1->pivotJump2",
  "pivotJump2->pivotJump3",
  "pivotJump3->muxA",
];

const groupFullAdder4Pivot = [
  "adder4->pivot18",
  "pivot18->pivot19",
  "pivot19->muxD",
  "pivot18->pivotJump8",
  "pivotJump8->pivotJump9",
  "pivotJump9->pivot13",
  "pivot13->muxC",
];
const groupAdder4Pivot = ["adder4->pivot18", "pivot18->pivot19", "pivot19->muxD"];
const groupPivotJump8 = [
  "adder4->pivot18",
  "pivot18->pivotJump8",
  "pivotJump8->pivotJump9",
  "pivotJump9->pivot13",
  "pivot13->muxC",
];

const groupRegistersUnitPivot2 = [
  "registersUnit->pivot2",
  "pivot2->muxB",
  "pivot2->branchUnit",
  "pivot2->pivot5",
  "pivot5->pivot6",
  "pivot6->dataMemory",
];
const groupPivot2_muxB = ["registersUnit->pivot2", "pivot2->muxB"];
const groupPivot2_branchUnit = ["registersUnit->pivot2", "pivot2->branchUnit"];
const groupPivot2_pivot5 = [
  "registersUnit->pivot2",
  "pivot2->pivot5",
  "pivot5->pivot6",
  "pivot6->dataMemory",
];

const groupBranchUnitPivot14 = [
  "branchUnit->pivot14",
  "pivot14->pivotJump10",
  "pivotJump10->pivot15",
  "pivot15->muxD",
];

const groupAluPivot7 = [
  "alu->pivot7",
  "pivot7->dataMemory",
  "pivot7->pivot8",
  "pivot8->pivotJump6",
  "pivotJump6->pivot9",
  "pivot9->muxC",
  "pivot7->pivot16",
  "pivot16->pivot17",
  "pivot17->muxD",
];
const groupPivot7_dataMemory = ["alu->pivot7", "pivot7->dataMemory"];
const groupPivot7_pivot8 = [
  "alu->pivot7",
  "pivot7->pivot8",
  "pivot8->pivotJump6",
  "pivotJump6->pivot9",
  "pivot9->muxC",
];
const groupPivot7_pivot16 = ["alu->pivot7", "pivot7->pivot16", "pivot16->pivot17", "pivot17->muxD"];

const groupMuxC_pivot11 = [
  "muxC->pivot11",
  "pivot11->pivot12",
  "pivot12->registersUnit",
];

// Grupo común para las conexiones de instructionMemory
const imGroup = [
  "instructionMemory->pivot3",
  "pivot3->pivot22",
  "pivot20->RegistersUnit[24:20]",
  "pivot20->pivot21",
  "pivot21->RegistersUnit[19:15]",
  "pivot21->pivot22",
  "pivot22->registersUnit[11:7]",
  "pivot22->pivot20",
  //"pivot23->controlUnit[14:12]",
  //"pivot23->pivot24",
  //"pivot24->controlUnit[6:0]",
  "pivot3->immediateGenerator[31:7]"
];

const edgeGroups: Record<string, string[]> = {
  "muxD->pc": ["muxD->pc"],

  "pivot25->instMemory": ["pc->pivot25", "pivot25->instMemory"],
  "pc->pivot25": ["pc->pivot25", "pivot25->pivot1", "pivot25->instMemory", "pc->pivot1", "pivot1->adder4", ...pivotJumpGroup],
  "pivot25->pivot1": ["pc->pivot25", "pivot25->pivot1", "pc->pivot1", "pivot1->adder4", ...pivotJumpGroup],
  "pivot1->adder4": ["pc->pivot25", "pivot25->pivot1", "pivot1->adder4"],
  "pivot1->pivotJump1": [...pivotJumpGroup],
  "pivotJump1->pivotJump2": [...pivotJumpGroup],
  "pivotJump2->pivotJump3": [...pivotJumpGroup],
  "pivotJump3->muxA": [...pivotJumpGroup],
  "four->adder4": ["four->adder4"],

  "adder4->pivot18": [...groupFullAdder4Pivot],
  "pivot18->pivot19": [...groupAdder4Pivot],
  "pivot19->muxD": [...groupAdder4Pivot],
  "pivot18->pivotJump8": [...groupPivotJump8],
  "pivotJump8->pivotJump9": [...groupPivotJump8],
  "pivotJump9->pivot13": [...groupPivotJump8],
  "pivot13->muxC": [...groupPivotJump8],

  "instructionMemory->pivot3": [...imGroup],
  "pivot3->pivot20": [...imGroup],
  "pivot20->pivot21": [...imGroup.slice(0, -1)],
  "pivot21->pivot22": [...imGroup],

  "pivot3->pivot22": [imGroup[0], imGroup[1]],
  "pivot20->RegistersUnit[24:20]": [imGroup[0], imGroup[1], imGroup[2]],
  "pivot21->RegistersUnit[19:15]": [imGroup[0], imGroup[1], imGroup[3], imGroup[4], imGroup[5]],
  "pivot22->registersUnit[11:7]": [imGroup[0], imGroup[1], imGroup[6]],  
  "pivot22->pivot20": [imGroup[0], imGroup[1], imGroup[2], imGroup[3], imGroup[4], imGroup[6], imGroup[7]],


  "pivot3->immediateGenerator[31:7]": [
    "instructionMemory->pivot3",
    "pivot3->immediateGenerator[31:7]"
  ],
  "immSrc->immGenerator": ["immSrc->immGenerator"],
  "immGenerator->pivotJump5": ["immGenerator->pivotJump5", "pivotJump5->pivot10", "pivot10->muxB"],
  "pivotJump5->pivot10": ["immGenerator->pivotJump5", "pivotJump5->pivot10", "pivot10->muxB"],  
  "pivot10->muxB": ["immGenerator->pivotJump5", "pivotJump5->pivot10", "pivot10->muxB"],

  "registersUnit->pivotJump4": [
    "registersUnit->pivotJump4",
    "pivotJump4->pivot4",
    "pivot4->branchUnit",
    "pivot4->muxA",
  ],
  "pivotJump4->pivot4": [
    "registersUnit->pivotJump4",
    "pivotJump4->pivot4",
    "pivot4->branchUnit",
    "pivot4->muxA",
  ],
  "pivot4->branchUnit": [
    "registersUnit->pivotJump4",
    "pivotJump4->pivot4",
    "pivot4->branchUnit"
  ],
  "pivot4->muxA": [
    "registersUnit->pivotJump4",
    "pivotJump4->pivot4",
    "pivot4->muxA"
  ],

  "branchUnit->pivot14": [...groupBranchUnitPivot14],
  "pivot14->pivotJump10": [...groupBranchUnitPivot14],
  "pivotJump10->pivot15": [...groupBranchUnitPivot14],
  "pivot15->muxD": [...groupBranchUnitPivot14],

  "dmWr->dataMemory": ["dmWr->dataMemory"],
  "dmCtrl->dataMemory": ["dmCtrl->dataMemory"],

  "registersUnit->pivot2": [...groupRegistersUnitPivot2],
  "pivot2->muxB": [...groupPivot2_muxB],
  "pivot2->branchUnit": [...groupPivot2_branchUnit],
  "pivot2->pivot5": [...groupPivot2_pivot5],
  "pivot5->pivot6": [...groupPivot2_pivot5],
  "pivot6->dataMemory": [...groupPivot2_pivot5],
  "ruWr->registersUnit": ["ruWr->registersUnit"],

  "muxA->alu": ["muxA->alu"],
  "muxB->alu": ["muxB->alu"],

  "aluASrc->muxA": ["aluASrc->muxA"],
  "aluBSrc->muxB": ["aluBSrc->muxB"],

  "brOp->branchUnit": ["brOp->branchUnit"],
  "aluOp->ALU": ["aluOp->ALU"],

  "alu->pivot7": [...groupAluPivot7],
  "pivot7->dataMemory": [...groupPivot7_dataMemory],
  "pivot7->pivot8": [...groupPivot7_pivot8],
  "pivot8->pivotJump6": [...groupPivot7_pivot8],
  "pivotJump6->pivot9": [...groupPivot7_pivot8],
  "pivot9->muxC": [...groupPivot7_pivot8],
  "pivot7->pivot16": [...groupPivot7_pivot16],
  "pivot16->pivot17": [...groupPivot7_pivot16],
  "pivot17->muxD": [...groupPivot7_pivot16],

  "dataMemory->muxC": ["dataMemory->muxC"],
  "ruDataWrSrc->muxC": ["ruDataWrSrc->muxC"],

  "muxC->pivot11": [...groupMuxC_pivot11],
  "pivot11->pivot12": [...groupMuxC_pivot11],
  "pivot12->registersUnit": [...groupMuxC_pivot11],
};

export const animateLine = (
  updateEdge: (id: string, newEdge: Partial<Edge>) => void,
  edge: Edge,
  edges: Edge[],
  animated: boolean = true
): void => {
  console.log("edge", edge)
  const idsToUpdate = edgeGroups[edge.id];
  
  idsToUpdate.forEach((id) => {
    const currentEdge = edges.find(e => e.id === id);
    
    if (currentEdge && 'disabled' in currentEdge && currentEdge.disabled) {
      return;
    }
    
    updateEdge(id, { 
      animated, 
      style: { stroke: "#3B59B6" } 
    });
  });
};