import { Edge  } from '@xyflow/react';
import { PC_MUXA } from './PC_MUXA';
import { BU_MUXD } from './BU_MUXD';

export const IF_IE: Edge[] = [
  ...PC_MUXA, // PC to MUXA connection
  ...BU_MUXD, // BU to MUXD connection

]
