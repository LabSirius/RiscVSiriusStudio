// This file contains the connection between the program counter and the instruction memory

import { Edge  } from '@xyflow/react';

export const PC_IM: Edge[] = [
  { id: 'pc->pivot25',  source: 'pc', target: 'pivot25', type: 'default'
 }
];
