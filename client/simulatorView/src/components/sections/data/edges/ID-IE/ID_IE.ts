import { Edge  } from '@xyflow/react';
import { IG_MUXB } from './IG_MUXB';
import { RU_BU } from './RU_BU';
import { RU_MUXS } from './RU_MUXS';

export const ID_IE: Edge[] = [
  ...IG_MUXB, // Immediate Generator to MUXB connection
  ...RU_BU, // Register Unit to Branch Unit connection
  ...RU_MUXS, // Register Unit to MUXS connection

]
