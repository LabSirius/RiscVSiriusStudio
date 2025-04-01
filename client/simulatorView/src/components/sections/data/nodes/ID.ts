/*
* this file contains the nodes of the second section of the simulator
*/

import {
    Node,
  } from '@xyflow/react';


export const ID: Node[] = [
    {
      id: 'ID',
      type: 'group',
      data: { label: 'Section 2' },
      position: { x: 800, y: 0 },
      draggable: false,
      style: {
        width: 700,
        height: 1400,
        backgroundColor: '#FFF9C4',
        border: '1px solid #eed97f',
        borderRadius: 8,
      },
    },

    {
      id: 'title-ID',
      type: 'title',
      data: { label: 'Decode (ID)' },
      position: { x: 0, y: 0 },
      parentId: 'ID',
      extent: 'parent',
      draggable: false,
      style: {
        width: 700,
        height: 50,
        backgroundColor: 'transparent',
        border: 'none',
        borderRadius: 0,
        padding: 0,
        boxShadow: 'none',
      },
    },

     // CHILD NODES SECTION 2
    {
      id: 'controlUnit',
      type: 'controlUnit',
      data: { label: 'Control Unit' },
      position: { x: 295, y: 310 },
      parentId: 'ID',
      extent: 'parent',
      style: {
        width: 170,
        height: 250,
        backgroundColor: 'transparent',
        border: 'none',
        borderRadius: 0,
        padding: 0,
        boxShadow: 'none',
      },
    },

    {
      id: 'ruWr',
      type: 'ruWr',
      data: { label: 'RUWR' },
      position: { x: 143, y: 1004 },
      parentId: 'ID',
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
      id: 'registersUnit',
      type: 'registerUnit',
      data: { label: 'Registers Unit' },
      position: { x: 295, y: 670 },
      parentId: 'ID',
      extent: 'parent',
      style: {
        width: 260,
        height: 400,
        backgroundColor: 'transparent',
        border: 'none',
        borderRadius: 0,
        padding: 0,
        boxShadow: 'none',
      },
    },

    {
      id: 'immSrc',
      type: 'immSrc',
      data: { label: 'IMMSrc' },
      position: { x: 148, y: 1281 },
      parentId: 'ID',
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
      id: 'immGenerator',
      type: 'immGenerator',
      data: { label: 'Immediate Generator' },
      position: { x: 295, y: 1220 },
      parentId: 'ID',
      extent: 'parent',
      style: {
        width: 260,
        height: 110,
        backgroundColor: 'transparent',
        border: 'none',
        borderRadius: 0,
        padding: 0,
        boxShadow: 'none',
      },
    },

    //PIVOTS S2
    //NODE INSTRUCTIONMEMORY-PIVOT-REGISTERSUNIT

    {
      id: 'pivot2',
      type: 'pivot2',
      data: { label: '' },
      position: { x: 640, y: 865 },
      parentId: 'ID',
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
      id: 'pivot3',
      type: 'pivot3',
      data: { label: '' },
      position: { x: 50, y: 865 },
      parentId: 'ID',
      extent: 'parent',
      style: {
        width: 1,
        height: 1,
        opacity: 0,
        backgroundColor: 'transparent',
        border: 'none',
        borderRadius: 0,
        padding: 0,
        boxShadow: 'none',
      },
    },


    {
      id: 'pivot5',
      type: 'pivot5',
      data: { label: '' },
      position: { x: 640, y: 1100 },
      parentId: 'ID',
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
      id: 'pivot12',
      type: 'pivot12',
      data: { label: '' },
      position: { x: 120, y: 1155 },
      parentId: 'ID',
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
      id: 'pivotJump1',
      type: 'pivotJump1',
      data: { label: 'pivotJump1' },
      position: { x: 32, y: 585 },
      parentId: 'ID',
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
      id: 'pivotJump2',
      type: 'pivotJump2',
      data: { label: 'pivotJump2' },
      position: { x: 621, y: 585 },
      parentId: 'ID',
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
      id: 'pivotJump4',
      type: 'pivotJump4',
      data: { label: 'pivotJump4' },
      position: { x: 621, y: 707 },
      parentId: 'ID',
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


  ];