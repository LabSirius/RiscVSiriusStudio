/*
* In this file  we define the initial edges for the pipeline flowchart (connections between nodes).
*/
import { Edge  } from '@xyflow/react';
import { PC_FE } from './PC_FE';
import { Inst_DE } from './Inst_DE';
import { PC_DE } from './PC_DE';
import { PC_EX } from './PC_EX';
import { PCInc_DE } from './PCInc_DE';
import { PCInc_EX } from './PCInc_EX';
import { PCInc_ME } from './PCInc_ME';
import { PCInc_WB } from './PCInc_WB';
import { RUrs1_EX } from './RUrs1_EX';
import { RUrs2_EX } from './RUrs2_EX';
import { ImmExt_EX } from './ImmExt_EX';
import { RUrs2_ME } from './RUrs2_ME';
import { ALURes_WB } from './ALURes_WB';
import { ALURes_ME } from './ALURes_ME';
import { DMDataRd_WB } from './DMDataRd_WB';
import { RD_EX_ME_WB } from './RD_EX_ME_WB';
import { CU_EX } from './CU_EX';
import { CU_MEM } from './CU_MEM';



export const initialEdges: Edge[] = [
   ...PC_FE,
   ...Inst_DE,

   ...PC_DE,
   ...PC_EX,
   ...PCInc_DE,
   ...PCInc_EX,
   ...PCInc_ME,
   ...PCInc_WB,

   ...RUrs1_EX,
   ...RUrs2_EX,

   ...ImmExt_EX,
   ...RUrs2_ME,

   ...ALURes_WB,
   ...ALURes_ME,

   ...DMDataRd_WB,

   ...RD_EX_ME_WB,

   ...CU_EX,
   ...CU_MEM,
];
