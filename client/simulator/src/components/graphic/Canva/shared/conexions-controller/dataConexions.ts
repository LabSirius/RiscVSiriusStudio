export const skipFunct7Edges = [
  'pivot30->pivot32',
  'pivot32->pivot33'
]

export const skipFunct3Edges = [
  'pivot28->pivot30',
  'pivot30->pivot31'
]

// output edge groups for MUX A route
export const skipMuxAOutputEdges = [
  'uxA->alu'
]

// Edge groups for skipping MUX A route
export const skipMuxA = [
  'aluASrc->muxA',
  'muxA->alu'
]

// Edge groups for MUX A route
export const muxARouteEdges = [
  'pivot1->pivotJump2',
  'pivotJump2->pivotJump3',
  'pivotJump3->muxA'
];

// Edge groups for no immediate generation
export const noImmediateEdges = [
  'pivot26->pivotJump1',
  'pivotJump1->immediateGenerator[31:7]',
  'immSrc->immGenerator',
  'immGenerator->pivotJump5',
  'pivotJump5->pivot10'
];

// Edge groups for MUX B route for R-type instructions
export const muxBRouteEdges_R = ['pivot10->muxB'];

// Edge groups for MUX B route for I-type instructions and others
export const muxBRouteEdges_I = [
  'registersUnit->pivot2',
  'pivot2->muxB'
];

// Edge groups for bypassing the branch unit
export const bypassBranchUnitEdges = [
  'pivot2->branchUnit',
  'pivot4->branchUnit',
];

// Edge groups for memory access (read) route
export const memoryReadEdges = [
  'pivot2->pivot5',
  'pivot5->pivot6',
  'pivot6->dataMemory',
  'pivot7->dataMemory',
  'dmWr->dataMemory',
  'dmCtrl->dataMemory'
];

// Edge groups for MUX C route for R-type instructions
export const muxCRouteEdges_R = [
  'dataMemory->muxC',
  'pivot18->pivotJump8',
  'pivotJump8->pivotJump9',
  'pivotJump9->pivot13',
  'pivot13->muxC'
];

// Edge groups for MUX D route for R-type instructions
export const muxDRouteEdges_R = [
  'pivot7->pivot16',
  'pivot16->pivot17',
  'pivot17->muxD'

];



// Edge groups for skipping RS2 register
export const skipRS1InputEdges = ['pivot20->pivot21' ,'pivot21->RegistersUnit[19:15]'];
export const skipRS1Edges = ['pivot20->RegistersUnit[19:15]', 'registersUnit->pivotJump4', 'pivotJump4->pivot4', 'pivot4->muxA'];
// Edge groups for skipping RS2 register
export const skipRS2Edges = ['pivot20->RegistersUnit[24:20]'];

export const skipRDEdges = ['pivot22->registersUnit[11:7]'];

// Additional edge groups for the MUX C route in load instructions (L-type)
export const muxCRouteExtraEdges_L = [
  'pivot7->pivot8',
  'pivot8->pivotJump6',
  'pivotJump6->pivot9',
  'pivot9->muxC'
];

// Edge groups for skipping RS2 in data memory access
export const skipRS2MemoryEdges = [
  'pivot2->pivot5',
  'pivot5->pivot6',
  'pivot6->dataMemory'
];

// Edge groups for the MUX D route in JALR instructions
export const muxDRouteEdges_JALR = [
  'pivot18->pivot19',
  'pivot19->muxD'
];

// Additional edge groups for the MUX C route in JALR instructions
export const muxCRouteExtraEdges_JALR = [
  'dataMemory->muxC',
  'pivot7->pivot8',
  'pivot8->pivotJump6',
  'pivotJump6->pivot9',
  'pivot9->muxC'
];

// Edge groups for bypassing the write-back stage
export const bypassWriteBackEdges = [
  'dataMemory->muxC',
  'pivot7->pivot8',
  'pivot8->pivotJump6',
  'pivotJump6->pivot9',
  'pivot9->muxC',
  'muxC->pivot11',
  'pivot11->pivot12',
  'pivot12->registersUnit',
  'ruWr->registersUnit',
  'ruDataWrSrc->muxC',
  ...muxCRouteEdges_R
];

export const fullMemoryAccessEdges = memoryReadEdges; 