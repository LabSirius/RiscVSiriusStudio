/*
* this file contains the nodes of the second section of the simulator
*/

import {
  Node,
} from '@xyflow/react';


export const section3: Node[] = [
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
    id: 'mux2_1A',
    type: 'mux2_1A',
    data: { label: 'MUX 2_1 A' },
    position: { x: 80, y: 625 },
    parentId: 'section-3',
    extent: 'parent',
    style: {
      width: 65,
      height: 150,
      backgroundColor: 'transparent',
      border: 'none',
      borderRadius: 0,
      padding: 0,
      boxShadow: 'none',
    },
  },

  {
    id: 'mux2_1B',
    type: 'mux2_1B',
    data: { label: 'MUX 2_1B' },
    position: { x: 80, y: 850 },
    parentId: 'section-3',
    extent: 'parent',
    style: {
      width: 65,
      height: 150,
      backgroundColor: 'transparent',
      border: 'none',
      borderRadius: 0,
      padding: 0,
      boxShadow: 'none',
    },
  },

];