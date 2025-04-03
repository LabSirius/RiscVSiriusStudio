import { Edge } from '@xyflow/react';

// Definición de rutas comunes
const pivotJumpGroup = [
  'pc->pivot1', 
  'pivot1->pivotJump1', 
  'pivotJump1->pivotJump2', 
  'pivotJump2->pivotJump3', 
  'pivotJump3->muxA'
];

const instructionMemoryGroup = [
  'instructionMemory->pivot3',  
  'pivot3->immediateGenerator[31:7]', 
  'pivot3->RegistersUnit[11:7]', 
  'pivot3->RegistersUnit[24:20]', 
  'pivot3->RegistersUnit[19:15]', 
  'pivot3->controlUnit[35:25]', 
  'pivot3->controlUnit[14:12]', 
  'pivot3->controlUnit[6:0]'
];

const edgeGroups: Record<string, string[]> = {
  // Grupo IF
  'pc->instMemory': ['pc->instMemory'],
  'pc->pivot1': ['pc->instMemory', 'pc->pivot1', 'pivot1->adder4', ...pivotJumpGroup],
  'pivot1->adder4': ['pc->pivot1', 'pivot1->adder4'],
  'pivot1->pivotJump1': pivotJumpGroup,
  'pivotJump1->pivotJump2': pivotJumpGroup,
  'pivotJump2->pivotJump3': pivotJumpGroup,
  'pivotJump3->muxA': pivotJumpGroup,
  'four->adder4': ['four->adder4'],

  'instructionMemory->pivot3': instructionMemoryGroup,
  'pivot3->immediateGenerator[31:7]': ['instructionMemory->pivot3', 'pivot3->immediateGenerator[31:7]'],
  'pivot3->RegistersUnit[11:7]': ['instructionMemory->pivot3', 'pivot3->RegistersUnit[11:7]'],
  'pivot3->RegistersUnit[24:20]': ['instructionMemory->pivot3', 'pivot3->RegistersUnit[24:20]'],
  'pivot3->RegistersUnit[19:15]': ['instructionMemory->pivot3', 'pivot3->RegistersUnit[19:15]'],
  'pivot3->controlUnit[35:25]': ['instructionMemory->pivot3', 'pivot3->controlUnit[35:25]'],
  'pivot3->controlUnit[14:12]': ['instructionMemory->pivot3', 'pivot3->controlUnit[14:12]'],
  'pivot3->controlUnit[6:0]': ['instructionMemory->pivot3', 'pivot3->controlUnit[6:0]'],
};

export const animateLine = (
  updateEdge: (id: string, newEdge: Partial<Edge>) => void,
  edge: Edge,
  animated: boolean = true
): void => {
  console.log('edge', edge);

  const idsToUpdate = edgeGroups[edge.id];

  idsToUpdate.forEach(id => updateEdge(id, { animated }));
};
