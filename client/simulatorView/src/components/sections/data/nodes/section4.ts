/*
* this file contains the nodes of the fourth section of the simulator
*/

import {
    Node,
  } from '@xyflow/react';


export const section4: Node[] = [
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
          border: '1px solid #93c4e6',
          borderRadius: 8,
        },
    },

    {
      id: 'title-MEM',
      type: 'title',
      data: { label: 'Memory (MEM)' },
      position: { x: 0, y: 0 },
      parentId: 'section-4',
      extent: 'parent',
      draggable: false,
      style: {
        width: 548,
        height: 50,
        backgroundColor: 'transparent',
        border: 'none',
        borderRadius: 0,
        padding: 0,
        boxShadow: 'none',
      },
    },
]