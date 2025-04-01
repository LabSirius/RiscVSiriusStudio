/*
* this file contains the nodes of the fourth section of the simulator
*/

import {
    Node,
  } from '@xyflow/react';


export const MEM: Node[] = [
    {
        id: 'MEM',
        type: 'group',
        data: { label: 'Section 4' },
        position: { x: 548 * 2 + 700, y: 0 },
        draggable: false,
        style: {
          width: 480,
          height: 1300,
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
      parentId: 'MEM',
      extent: 'parent',
      draggable: false,
      style: {
        width: 480,
        height: 50,
        backgroundColor: 'transparent',
        border: 'none',
        borderRadius: 0,
        padding: 0,
        boxShadow: 'none',
      },
    },

    {
      id: 'dataMemory',
      type: 'dataMemory', 
      data: { label: 'Data Memory' },
      position: { x: 160, y: 611 },
      parentId: 'MEM',
      extent: 'parent',
      style: {
        width: 260,
        height: 280,
        backgroundColor: 'transparent',
        border: 'none',
        borderRadius: 0,
        padding: 0,
        boxShadow: 'none',
      },
    },

    {
      id: 'dmWr',
      type: 'dmWr',
      data: { label: 'DMWR' },
      position: { x: 188, y: 530 },
      parentId: 'MEM',
      extent: 'parent',
      style: {
        width: 90,
        height: 30,
        backgroundColor: 'transparent',
        border: 'none',
        borderRadius: 0,
        padding: 0,
        boxShadow: 'none',
      },
    },

    {
      id: 'dmCtrl',
      type: 'dmCtrl',
      data: { label: 'DMCtrl' },
      position: { x: 298, y: 530 },
      parentId: 'MEM',
      extent: 'parent',
      style: {
        width: 90,
        height: 30,
        backgroundColor: 'transparent',
        border: 'none',
        borderRadius: 0,
        padding: 0,
        boxShadow: 'none',
      },
    },

    //Pivots

    {
      id: 'pivot6',
      type: 'pivot6',
      data: { label: '' },
      position: { x: 85, y: 1020},
      parentId: 'MEM',
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
      id: 'pivot7',
      type: 'pivot7',
      data: { label: '' },
      position: { x: 40, y: 734},
      parentId: 'MEM',
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
      id: 'pivot8',
      type: 'pivot8',
      data: { label: '' },
      position: { x: 40, y: 948},
      parentId: 'MEM',
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
      id: 'pivot14',
      type: 'pivot14',
      data: { label: '' },
      position: { x: 59, y: 90},
      parentId: 'MEM',
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

    //jump

    {
      id: 'pivotJump6',
      type: 'pivotJump6',
      data: { label: 'pivotJump6' },
      position: { x: 66, y: 923 },
      parentId: 'MEM',
      extent: 'parent',
      style: {
        width: 47,
        height: 47,
        backgroundColor: 'transparent',
        border: 'none',
        borderRadius: 0,
        padding: 0,
        boxShadow: 'none',
      },
    },
    {
      id: 'pivotJump8',
      type: 'pivotJump8',
      data: { label: 'pivotJump8' },
      position: { x: 40, y: 171 },
      parentId: 'MEM',
      extent: 'parent',
      style: {
        width: 47,
        height: 47,
        backgroundColor: 'transparent',
        border: 'none',
        borderRadius: 0,
        padding: 0,
        boxShadow: 'none',
      },
    },
]