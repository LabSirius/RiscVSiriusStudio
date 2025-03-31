/*
* this file contains the nodes for section 1 of the simulator view
* 
*/

import {
    Node,
  } from '@xyflow/react';


export const IF: Node[] = [
    {
      id: 'IF',
      type: 'group',
      data: { label: 'Section 1' },
      position: { x: 0, y: 0 },
      draggable: false, 
      style: {
        width: 620,
        height: 1200,
        backgroundColor: '#FCE4EC',
        border: '1px solid #e3aaaa',
        borderRadius: 8,
      },
    },

    {
      id: 'title-IF',
      type: 'title',
      data: { label: 'Fetch (IF)' },
      position: { x: 0, y: 0 },
      parentId: 'IF',
      extent: 'parent',
      draggable: false,
      style: {
        width: 620,
        height: 50,
        backgroundColor: 'transparent',
        border: 'none',
        borderRadius: 0,
        padding: 0,
        boxShadow: 'none',
      },
    },
  
    {
      id: 'pc',
      type: 'pc',
      data: { label: 'PC' },
      position: { x: 30, y: 585 },
      parentId: 'IF',
      extent: 'parent',
      style: {
        width: 90,
        height: 120,
        backgroundColor: 'transparent',
        border: 'none',
        borderRadius: 0,
        padding: 0,
        boxShadow: 'none',
      },
    },


    {
      id: 'adder4',
      type: 'adder4',
      data: { label: 'Adder 4' },
      position: { x: 440, y: 150 },
      parentId: 'IF',
      extent: 'parent',
      style: {
        width: 90,
        height: 120,
        backgroundColor: 'transparent',
        border: 'none',
        borderRadius: 0,
        padding: 0,
        boxShadow: 'none',
      },
    },
  
    {
      id: 'four',
      type: 'four',
      data: { label: '4' },
      position: { x: 310, y: 117},
      parentId: 'IF',
      extent: 'parent',
      style: {
        width: 90,
        height: 120,
        backgroundColor: 'transparent',
        border: 'none',
        borderRadius: 0,
        padding: 0,
        boxShadow: 'none',
      },
    },
  
  
    {
      id: 'instructionMemory',
      type: 'instructionMemory', 
      data: { label: 'Instruction Memory' },
      position: { x: 300, y: 545 },
      parentId: 'IF',
      extent: 'parent',
      style: {
        width: 230,
        height: 200,
        backgroundColor: 'transparent',
        border: 'none',
        borderRadius: 0,
        padding: 0,
        boxShadow: 'none',
      },
    },

    

    //PIVOTS S1

    //NODE PC-PIVOT-ADDER4
    {
      id: 'pivot1',
      type: 'pivot1',
      data: { label: '' },
      position: { x: 200, y: 470 },
      parentId: 'IF',
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

  ];