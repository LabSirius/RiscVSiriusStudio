

//IF STAGE
export const pc_pc_ID = ["pivot1->pc_id"]
export const muxD_pc = ["muxD->pc_fe", "pc_fe->pc"]

export const pc_adder4 = ["pc->pivot25", "pivot25->pivot1", "pivot1->adder4"];
export const four_adder4 = ["four->adder4"];

export const pc_im = ["pc->pivot25", "pivot25->instMemory"];


//IF-ID
export const im_instID = ["instructionMemory->inst_id"]
export const adder4_pcIncID = ["adder4->pivot18", "pivot18->pcinc_de"]

export const pcIncID_pcIncIE = ["pcinc_de->pcinc_ie"]
export const pcID_pcEX = ["pc_id->pc_ie"]


//ID STAGE

  //registers unit
export const im_rs1 = [
  "inst_id->pivot3",
  "pivot3->pivot22",
  "pivot22->pivot20",
  "pivot20->pivot21",
  "pivot21->RegistersUnit[19:15]",
];

export const im_rs2 = [
  "inst_id->pivot3",
  "pivot3->pivot22",
  "pivot22->pivot20",
  "pivot20->RegistersUnit[24:20]",
];


  //imm generator
export const im_immGen = [
  "pivot3->pivot26",
  "pivot26->pivotJump11",
  "pivotJump11->pivotJump1",
  "pivotJump1->immediateGenerator[31:7]",
];

export const immSrc_immGen = ["immSrc->immGenerator"];


 //control unit

export const im_opcode = [
  "inst_id->pivot3",
  "pivot3->pivot26",
  "pivot26->pivot38",
  "pivot38->pivot27",
  "pivot27->pivot28",
  "pivot28->pivot29",
];

export const im_funct3 = [
  "inst_id->pivot3",
  "pivot3->pivot26",
  "pivot26->pivot38",
  "pivot38->pivot27",
  "pivot27->pivot28",
  "pivot28->pivot29",
  "pivot28->pivot30",
  "pivot30->pivot31",
];

export const im_funct7 = [
  "inst_id->pivot3",
  "pivot3->pivot26",
  "pivot26->pivot38",
  "pivot38->pivot27",
  "pivot27->pivot28",
  "pivot28->pivot29",
  "pivot28->pivot30",
  "pivot30->pivot32",
  "pivot32->pivot33",
];




// ID-EX
export const ru_rurs1_IE = ["registersUnit->rurs1_ie"]
export const ru_rurs2_IE = ["registersUnit->rurs2_ie"]
export const immGen_immExit_IE= ["immGenerator->immext_ie"]



export const muxC_rd = ["muxC->pivot11", "pivot11->pivot12", "pivot12->registersUnit"];

export const RUWr_wb = ["ruWr->registersUnit"];





//MUXA
export const rs1_muxA = ["registersUnit->pivotJump4", "pivotJump4->pivot4", "pivot4->muxA"];

export const pc_muxA = [
  "pc->pivot25",
  "pivot25->pivot1",
  "pivot1->pivotJump2",
  "pivotJump2->pivotJump3",
  "pivotJump3->muxA",
];

export const aluASrc_muxA = ["aluASrc->muxA"];

//MUXB
export const rs2_muxB = ["registersUnit->pivot2", "pivot2->muxB"];

export const immGen_muxB = ["immGenerator->pivotJump5", "pivotJump5->pivot10", "pivot10->muxB"];

export const aluBSrc_muxB = ["aluBSrc->muxB"];

//ALU
export const muxA_aluA = ["muxA->alu"];

export const muxB_aluB = ["muxB->alu"];

export const aluOp_alu = ["aluOp->ALU"];

//BRANCH
export const rs1_bu = ["registersUnit->pivotJump4", "pivotJump4->pivot4", "pivot4->branchUnit"];

export const rs2_bu = ["registersUnit->pivot2", "pivot2->branchUnit"];

export const brOp_bu = ["brOp->branchUnit"];

//DATA MEMORY
export const alu_dm = ["alu->pivot7", "pivot7->dataMemory"];

export const rs2_dm = [
  "registersUnit->pivot2",
  "pivot2->pivot5",
  "pivot5->pivot6",
  "pivot6->dataMemory",
];

export const dmWr_dm = ["dmWr->dataMemory"];

export const dmCtrl_dm = ["dmCtrl->dataMemory"];

//MUX C
export const adder4_muxC = [
  "adder4->pivot18",
  "pivot18->pivotJump8",
  "pivotJump8->pivotJump9",
  "pivotJump9->pivot13",
  "pivot13->muxC",
];

export const dm_muxC = [
    "dataMemory->muxC"
]

export const alu_muxC = [
    "alu->pivot7",
    "pivot7->pivot8",
    "pivot8->pivotJump6",
    "pivotJump6->pivot9",
    "pivot9->muxC"
]

export const ruDataWrSrc_muxC = [
    "ruDataWrSrc->muxC"
]


//MUX D
export const alu_muxD = [
    "alu->pivot7",
    "pivot7->pivot16",
    "pivot16->pivot17",
    "pivot17->muxD"
]

export const adder4_muxD = [
    "adder4->pivot18",
    "pivot18->pivot19",
    "pivot19->muxD"
]

export const bu_muxD = [
    "branchUnit->pivot14",
    "pivot14->pivotJump10",
    "pivotJump10->pivot15",
    "pivot15->muxD"
]