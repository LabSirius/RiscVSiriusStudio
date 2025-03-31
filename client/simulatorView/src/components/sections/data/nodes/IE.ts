/*
* this file contains the nodes of the second third of the simulator
*/

import {
    Node,
  } from '@xyflow/react';


export const IE: Node[] = [
    {
        id: 'IE',
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
      id: 'title-IE',
      type: 'title',
      data: { label: 'Execute (IE)' },
      position: { x: 0, y: 0 },
      parentId: 'IE',
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

 

    {
        id: 'muxA',
        type: 'muxA',
        data: { label: 'MUX A' },
        position: { x: 140, y: 465 },
        parentId: 'IE',
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
        id: 'aluASrc',
        type: 'aluASrc',
        data: { label: 'ALU A SRC' },
        position: { x: 140, y: 360 },
        parentId: 'IE',
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
        id: 'muxB',
        type: 'muxB',
        data: { label: 'MUX B' },
        position: { x: 140, y: 660 },
        parentId: 'IE',
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
        id: 'aluBSrc',
        type: 'aluBSrc',
        data: { label: 'ALU B SRC' },
        position: { x: 140, y: 760 },
        parentId: 'IE',
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
        id: 'alu',
        type: 'alu',
        data: { label: 'ALU' },
        position: { x: 250, y: 465 },
        parentId: 'IE',
        extent: 'parent',
        style: {
          width: 240,
          height: 320,
          backgroundColor: 'transparent',
          border: 'none',
          borderRadius: 0,
          padding: 0,
          boxShadow: 'none',
        },
      },

      {
        id: 'aluOp',
        type: 'aluOp',
        data: { label: 'ALU OPERATION' },
        position: { x: 338, y: 761 },
        parentId: 'IE',
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
        id: 'branchUnit',
        type: 'branchUnit',
        data: { label: 'Branch Unit' },
        position: { x: 250, y: 235 },
        parentId: 'IE',
        extent: 'parent',
        style: {
          width: 240,
          height: 110,
          backgroundColor: 'transparent',
          border: 'none',
          borderRadius: 0,
          padding: 0,
          boxShadow: 'none',
        },
      },


    //PIVOTS S3


    {
      id: 'pivot2',
      type: 'pivot2',
      data: { label: '' },
      position: { x: 25, y: 705 },
      parentId: 'IE',
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
      id: 'pivot4',
      type: 'pivot4',
      data: { label: '' },
      position: { x: 70, y: 573},
      parentId: 'IE',
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
        id: 'pivotJump2',
        type: 'pivotJump2',
        data: { label: 'pivotJump2' },
        position: { x: 8, y: 445 },
        parentId: 'IE',
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



     //jump
     {
      id: 'pivotJump3',
      type: 'pivotJump3',
      data: { label: 'pivotJump3' },
      position: { x: 51, y: 445 },
      parentId: 'IE',
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