/*
* In this file  we define the initial edges for the pipeline flowchart (connections between nodes).
*/
import { Edge  } from '@xyflow/react';
import { PC_FE } from './PC_FE';
import { Inst_ID } from './Inst_ID';
import { PC_ID } from './PC_ID';
import { PC_IE } from './PC_IE';
import { PCInc_ID } from './PCInc_ID';
import { PCInc_IE } from './PCInc_IE';
import { PCInc_MEM } from './PCInc_MEM';
import { PCInc_WB } from './PCInc_WB';
import { RUrs1_IE } from './RUrs1_IE';
import { RUrs2_IE } from './RUrs2_IE';
import { ImmExt_IE } from './ImmExt_IE';
import { RUrs2_MEM } from './RUrs2_MEM';
import { ALURes_WB } from './ALURes_WB';
import { ALURes_MEM } from './ALURes_MEM';
import { DMDataRd_WB } from './DMDataRd_WB';
import { RD_IE_MEM_WB } from './RD_IE_MEM_WB';
import { CU_IE } from './CU_IE';
import { CU_MEM } from './CU_MEM';
import { CU_WB } from './CU_WB';
import { CU_ID } from './CU_ID';



export const initialEdges: Edge[] = [
   ...PC_FE,
   ...Inst_ID,

   ...PC_ID,
   ...PC_IE,
   ...PCInc_ID,
   ...PCInc_IE,
   ...PCInc_MEM,
   ...PCInc_WB,

   ...RUrs1_IE,
   ...RUrs2_IE,

   ...ImmExt_IE,
   ...RUrs2_MEM,

   ...ALURes_WB,
   ...ALURes_MEM,

   ...DMDataRd_WB,

   ...RD_IE_MEM_WB,

   ...CU_IE,
   ...CU_MEM,
   ...CU_WB,
   ...CU_ID
];
