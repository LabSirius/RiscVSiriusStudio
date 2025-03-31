/*
* In this file  we define the initial edges for the flowchart (connections between nodes).
* Each edge has an id, source node, target node, and type.
*/
import { Edge  } from '@xyflow/react';

import { IF } from './IF/IF';
import { ID } from './ID/ID';
import { IF_ID } from './IF-ID/IF-ID';
import { IF_IE } from './IF-IE/IF-IE';
import { ID_IE } from './ID-IE/ID_IE';
import { IE } from './IE/IE';
import { IE_MEM } from './IE-MEM/IE_MEM';

export const initialEdges: Edge[] = [
  ...IF, // IF stage edges
  ...ID, // ID stage edges
  ...IF_ID, // IF-ID stage edges
  ...IF_IE, // IF-IE stage edges
  ...ID_IE, // ID-IE stage edges
  ...IE, // IE stage edges
  ...IE_MEM, // IE-MEM stage edges
];
