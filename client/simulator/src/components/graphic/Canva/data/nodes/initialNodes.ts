/*
* In this file, we define the initial nodes for the diagram.
* Each node has properties such as id, type, data, position, parentId, extent, and style.
* 
*/

import {
    Node,
  } from '@xyflow/react';
import { IF } from './IF';
import { ID } from './ID';
import { IE } from './IE';
import { MEM } from './MEM';
import { WB } from './WB';


export const initialNodes: Node[] = [
    
    ...IF, // Importing nodes from IF.ts
    ...ID, // Importing nodes from ID.ts
    ...IE, // Importing nodes from IE.ts
    ...MEM, // Importing nodes from MEM.ts
    ...WB, // Importing nodes from WB.ts
   
  ];