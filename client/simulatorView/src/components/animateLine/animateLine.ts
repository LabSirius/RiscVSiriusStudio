import { Edge } from '@xyflow/react';

export const animateLine = (
  updateEdge: (id: string, newEdge: Partial<Edge>) => void,
  edge: Edge,
  animated: boolean = true
): void => {


  console.log(edge.id)
  //
  if(edge.id === 'pc->pivot1' ){
    updateEdge(edge.id, { animated });
    updateEdge('pc->instMemory', { animated })
    updateEdge('pivot1->adder4', { animated })
  }
  else{
    updateEdge(edge.id, { animated });
  }
  
};
