import { Edge  } from '@xyflow/react';
import { immSrc_IG } from './immSrc_IG';
import { RUWr_RU } from './RUWr_RU';

export const ID: Edge[] = [
  ...immSrc_IG, // Immediate Source to Immediate Generator connection
  ...RUWr_RU, // Register Unit Write to Register Unit connection
]
