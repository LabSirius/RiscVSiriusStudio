import { Edge } from '@xyflow/react';

export const animateLine = (
  updateEdge: (id: string, newEdge: Partial<Edge>) => void,
  edge: Edge,
  animated: boolean = true
): void => {

  console.log('edge', edge);

  if(edge.id === 'pc->instMemory'){
      updateEdge(edge.id, { animated: animated, style: { stroke: 'red' } });
  }
};
