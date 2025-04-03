import { Edge } from '@xyflow/react';

const pivotJumpGroup = [
  'pc->pivot1', 
  'pivot1->pivotJump1', 
  'pivotJump1->pivotJump2', 
  'pivotJump2->pivotJump3', 
  'pivotJump3->muxA'
];

const edgeGroups: Record<string, string[]> = {
  'pc->instMemory': ['pc->instMemory'],
  'pc->pivot1': ['pc->instMemory', 'pc->pivot1', 'pivot1->adder4', ...pivotJumpGroup],
  'pivot1->adder4': ['pc->pivot1', 'pivot1->adder4'],
  'pivot1->pivotJump1': pivotJumpGroup,
  'pivotJump1->pivotJump2': pivotJumpGroup,
  'pivotJump2->pivotJump3': pivotJumpGroup,
  'pivotJump3->muxA': pivotJumpGroup,
  'four->adder4': ['four->adder4']
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
