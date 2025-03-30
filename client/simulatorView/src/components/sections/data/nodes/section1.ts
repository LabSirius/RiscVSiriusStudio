/*
* this file contains the nodes for section 1 of the simulator view
* 
*/

import {
    Node,
  } from '@xyflow/react';


export const section1: Node[] = [
    {
      id: 'section-1',
      type: 'group',
      data: { label: 'Section 1' },
      position: { x: 0, y: 0 },
      draggable: false, 
      style: {
        width: 548,
        height: 1200,
        backgroundColor: '#FCE4EC',
        border: '1px solid #e3aaaa',
        borderRadius: 8,
      },
    },
  
    {
      id: 'pc',
      type: 'pcSvg',
      data: { label: 'PC' },
      position: { x: 30, y: 713 },
      parentId: 'section-1',
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
      type: 'adder4Svg',
      data: { label: 'Adder 4' },
      position: { x: 440, y: 120 },
      parentId: 'section-1',
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
      type: 'fourSvg',
      data: { label: '4' },
      position: { x: 310, y: 90},
      parentId: 'section-1',
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
      type: 'instructionMemorySvg', 
      data: { label: 'Instruction Memory' },
      position: { x: 300, y: 670 },
      parentId: 'section-1',
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
      id: 'pcPivotAdder4',
      type: 'pcPivotAdder4',
      data: { label: '' },
      position: { x: 200, y: 200 },
      parentId: 'section-1',
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