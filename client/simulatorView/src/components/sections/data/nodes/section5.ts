/*
* this file contains the nodes of the fourth section of the simulator
*/

import {
    Node,
  } from '@xyflow/react';


export const section5: Node[] = [
    {
        id: 'section-5',
        type: 'group',
        data: { label: 'Section 5' },
        position: { x: 548 * 4, y: 0 },
        draggable: false,
        style: {
          width: 400,
          height: 1200,
          backgroundColor: '#E3F2FD',
          border: '1px solid #93c4e6',
          borderRadius: 8,
        },
    },

    {
      id: 'title-WB',
      type: 'title',
      data: { label: 'Write back (WB)' },
      position: { x: 0, y: 0 },
      parentId: 'section-5',
      extent: 'parent',
      draggable: false,
      style: {
        width: 400,
        height: 50,
        backgroundColor: 'transparent',
        border: 'none',
        borderRadius: 0,
        padding: 0,
        boxShadow: 'none',
      },
    },
]