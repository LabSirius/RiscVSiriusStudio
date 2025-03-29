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


export const initialNodes: Node[] = [
    
    ...section1, // Importing nodes from section1.ts
    ...section2, // Importing nodes from section2.ts

    // OTHER SECTIONS (STATIC)
  
    {
      id: 'section-3',
      type: 'group',
      data: { label: 'Section 3' },
      position: { x: 548 * 2, y: 0 },
      draggable: false,
      style: {
        width: 548,
        height: 1200,
        backgroundColor: '#E3F2FD',
        border: '1px solid #93c4e6',
        borderRadius: 8,
      },
    },
   
    {
      id: 'section-4',
      type: 'group',
      data: { label: 'Section 4' },
      position: { x: 548 * 3, y: 0 },
      draggable: false,
      style: {
        width: 548,
        height: 1200,
        backgroundColor: '#E8F5E9',
        border: '1px solid #b9e8d1',
        borderRadius: 8,
      },
    },
   
  ];