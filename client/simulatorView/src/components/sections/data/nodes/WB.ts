/*
* this file contains the nodes of the fourth section of the simulator
*/

import {
    Node,
  } from '@xyflow/react';


export const WB: Node[] = [
    {
        id: 'WB',
        type: 'group',
        data: { label: 'Section 5' },
        position: { x: 548 * 4, y: 0 },
        draggable: false,
        style: {
          width: 300,
          height: 1200,
          backgroundColor: '#E3F2FD',
          border: '1px solid #93c4e6',
          borderRadius: 8,
        },
    },

    // {
    //   id: 'title-WB',
    //   type: 'title',
    //   data: { label: 'Write back (WB)' },
    //   position: { x: 0, y: 0 },
    //   parentId: 'WB',
    //   extent: 'parent',
    //   draggable: false,
    //   style: {
    //     width: 300,
    //     height: 50,
    //     backgroundColor: 'transparent',
    //     border: 'none',
    //     borderRadius: 0,
    //     padding: 0,
    //     boxShadow: 'none',
    //   },
    // },


    {
      id: 'muxC',
      type: 'muxC',
      data: { label: 'MUX C' },
      position: { x: 90, y: 660 },
      parentId: 'WB',
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
      id: 'ruDataWrSrc',
      type: 'ruDataWrSrc',
      data: { label: 'RUDataWrSrc' },
      position: { x: 90, y: 765},
      parentId: 'WB',
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

    //pivot

    {
      id: 'pivot9',
      type: 'pivot9',
      data: { label: '' },
      position: { x: 18, y: 868 },
      parentId: 'WB',
      extent: 'parent',
      style: {
        width: 1,
        height: 1,
        backgroundColor: 'transparent',
        border: 'none',
        borderRadius: 0,
        padding: 0,
        boxShadow: 'none',
      },
    },

    {
      id: 'pivot11',
      type: 'pivot11',
      data: { label: '' },
      position: { x: 169, y: 990 },
      parentId: 'WB',
      extent: 'parent',
      style: {
        width: 1,
        height: 1,
        backgroundColor: 'transparent',
        border: 'none',
        borderRadius: 0,
        padding: 0,
        boxShadow: 'none',
      },
    },
]