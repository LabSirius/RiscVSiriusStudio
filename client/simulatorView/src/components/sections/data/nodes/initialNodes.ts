/*
* In this file, we define the initial nodes for the diagram.
* Each node has properties such as id, type, data, position, parentId, extent, and style.
* 
*/

import {
    Node,
  } from '@xyflow/react';
import { section1 } from './section1';
import { section2 } from './section2';
import { section3 } from './section3';
import { section4 } from './section4';
import { section5 } from './section5';


export const initialNodes: Node[] = [
    
    ...section1, // Importing nodes from section1.ts
    ...section2, // Importing nodes from section2.ts
    ...section3, // Importing nodes from section3.ts
    ...section4, // Importing nodes from section4.ts
    ...section5, // Importing nodes from section5.ts
   
  ];