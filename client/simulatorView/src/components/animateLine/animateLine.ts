import { Edge } from '@xyflow/react';

const pcToX = new Set([
  'pc->pivot1',
  'pc->instMemory',
  'pivot1->pivotJump1',
  'pivotJump1->pivotJump2',
  'pivotJump2->pivotJump3',
  'pivotJump3->muxA'
]);

export const animateLine = (
  updateEdge: (id: string, newEdge: Partial<Edge>) => void,
  edge: Edge,
  animated: boolean = true
): void => {

  console.log('edge', edge);

  if (pcToX.has(edge.id)) {
    updateEdge('pc->pivot1', { animated });
    updateEdge('pc->instMemory', { animated });
    updateEdge('pivot1->adder4', { animated });
    updateEdge('pivot1->pivotJump1', { animated });
    updateEdge('pivotJump1->pivotJump2', { animated });
    updateEdge('pivotJump2->pivotJump3', { animated });
    updateEdge('pivotJump3->muxA', { animated });
  } else {
    updateEdge(edge.id, { animated });
  }
};
