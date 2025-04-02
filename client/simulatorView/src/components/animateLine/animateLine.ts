import { Edge } from '@xyflow/react';


const pcToXEdges = [
  'pc->pivot1',
  'pc->instMemory',
  'pivot1->adder4',
  'pivot1->pivotJump1',
  'pivotJump1->pivotJump2',
  'pivotJump2->pivotJump3',
  'pivotJump3->muxA'
];

const instMemToXEdges = [
  'instructionMemory->pivot3',
  'pivot3->immediateGenerator[31:7]',
  'pivot3->RegistersUnit[11:7]',
  'pivot3->RegistersUnit[24:20]',
  'pivot3->RegistersUnit[19:15]',
  'pivot3->RegistersUnit[4:0]',
  'pivot3->controlUnit[35:25]',
  'pivot3->controlUnit[14:12]',
  'pivot3->controlUnit[6:0]'
];

export const animateLine = (
  updateEdge: (id: string, newEdge: Partial<Edge>) => void,
  edge: Edge,
  animated: boolean = true
): void => {

  console.log('edge', edge);

  if (pcToXEdges.includes(edge.id)) {
    pcToXEdges.forEach(id => updateEdge(id, { animated }));
  } else if (instMemToXEdges.includes(edge.id)) {
    instMemToXEdges.forEach(id => updateEdge(id, { animated }));
  }
  
};
