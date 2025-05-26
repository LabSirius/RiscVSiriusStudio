import { Edge  } from '@xyflow/react';
import { IG_MUXB } from './IG_MUXB';
import { RU_MUXS } from './RU_MUXS';

export const ID_IE: Edge[] = [
  ...IG_MUXB, // Immediate Generator to MUXB connection
  ...RU_MUXS, // Register Unit to MUXS connection

]
