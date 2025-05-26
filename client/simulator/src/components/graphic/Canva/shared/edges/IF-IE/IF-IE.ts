import { Edge  } from '@xyflow/react';
import { BU_MUXD } from './BU_MUXD';
import { ALU_MUXD } from './ALU_MUXD';

export const IF_IE: Edge[] = [
  ...BU_MUXD, // BU to MUXD connection
  ...ALU_MUXD, // ALU to MUXD connection

]
