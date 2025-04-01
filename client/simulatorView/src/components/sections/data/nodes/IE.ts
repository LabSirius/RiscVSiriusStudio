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
        position: { x: 800 + 700, y: 0 },
        draggable: false,
        style: {
          width: 548,
          height: 1300,
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
        position: { x: 165, y: 545 },
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
        position: { x: 153, y: 475 },
        parentId: 'IE',
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
        id: 'muxB',
        type: 'muxB',
        data: { label: 'MUX B' },
        position: { x: 165, y: 740 },
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
        position: { x: 153, y: 922 },
        parentId: 'IE',
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
        id: 'alu',
        type: 'alu',
        data: { label: 'ALU' },
        position: { x: 275, y: 575 },
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
        position: { x: 350, y: 940 },
        parentId: 'IE',
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
        id: 'branchUnit',
        type: 'branchUnit',
        data: { label: 'Branch Unit' },
        position: { x: 275, y: 280 },
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

      {
        id: 'brOp',
        type: 'brOp',
        data: { label: 'BrOp' },
        position: { x: 350, y: 440 },
        parentId: 'IE',
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


    //PIVOTS S3

    {
      id: 'pivot4',
      type: 'pivot4',
      data: { label: '' },
      position: { x: 45, y: 653},
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
      id: 'pivot10',
      type: 'pivot10',
      data: { label: '' },
      position: { x: 44, y:1194},
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
      id: 'pivotJump3',
      type: 'pivotJump3',
      data: { label: 'pivotJump3' },
      position: { x: 25, y: 505 },
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

    {
      id: 'pivotJump5',
      type: 'pivotJump5',
      data: { label: 'pivotJump5' },
      position: { x: 25, y: 995 },
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

    
    {
      id: 'pivotJump7',
      type: 'pivotJump7',
      data: { label: 'pivotJump7' },
      position: { x: 25, y: 1050 },
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