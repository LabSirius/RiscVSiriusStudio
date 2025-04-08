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
      zIndex: 25,
      style: {
        width: 920,
        height: 1375,
        backgroundColor: '#FCE4EC',
        border: '1px solid #FCE4EC',
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
        width: 800,
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
      position: { x: 280, y: 705 },
      parentId: 'IF',
      extent: 'parent',
      style: {
        width: 180,
        height: 239,
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
      position: { x: 660, y: 245 },
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
      position: { x: 530, y: 211 },
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
      position: { x: 570, y: 705 },
      parentId: 'IF',
      extent: 'parent',
      style: {
        width: 290,
        height: 339,
        backgroundColor: 'transparent',
        border: 'none',
        borderRadius: 0,
        padding: 0,
        boxShadow: 'none',
      },
    },
    
    {
      id: 'muxD',
      type: 'muxD',
      data: { label: 'MUX D' },
      position: { x: 158, y: 800 },
      parentId: 'IF',
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
    
    //PIVOTS S1
    
    //NODE PC-PIVOT-ADDER4
    {
      id: 'pivot1',
      type: 'pivot1',
      data: { label: '' },
      position: { x: 500, y: 606 },
      parentId: 'IF',
      extent: 'parent',
      style: {
        width: 5,
        height: 5,
        backgroundColor: 'black',
        border: 'none',
        borderRadius: 0,
        padding: 0,
        boxShadow: 'none',
      },
    },
    
    {
      id: 'pivot15',
      type: 'pivot15',
      data: { label: '' },
      position: { x: 188, y: 198 },
      parentId: 'IF',
      extent: 'parent',
      style: {
        width: 5,
        height: 5,
        backgroundColor: 'black',
        border: 'none',
        borderRadius: 0,
        padding: 0,
        boxShadow: 'none',
      },
    },

    {
      id: 'pivot17',
      type: 'pivot17',
      data: { label: '' },
      position: { x: 50, y: 90 },
      parentId: 'IF',
      extent: 'parent',
      style: {
        width: 5,
        height: 5,
        backgroundColor: 'black',
        border: 'none',
        borderRadius: 0,
        padding: 0,
        boxShadow: 'none',
      },
    },

    {
      id: 'pivot25',
      type: 'pivot25',
      data: { label: '' },
      position: { x: 500, y: 818.9 },
      parentId: 'IF',
      extent: 'parent',
      style: {
        width: 5,
        height: 5,
        backgroundColor: 'black',
        border: 'none',
        borderRadius: 0,
        padding: 0,
        boxShadow: 'none',
      },
    },

  ];