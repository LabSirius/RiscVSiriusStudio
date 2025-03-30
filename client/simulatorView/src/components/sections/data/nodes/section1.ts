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
        opacity: 0.5,
        border: '1px solid #e3aaaa',
        borderRadius: 8,
      },
    },

    {
      id: 'instruction-fetch-title',
      type: 'titleText',
      data: { label: 'Fetch (IF)' },
      position: { x: 0, y: 10 },
      parentId: 'section-1',
      extent: 'parent',
      selectable: false,
      draggable: false,
      style: {
        // TODO; this has to go in TitleText.tsx for the other titles to be consistently rendered.
        fontSize: '28px',
        fontWeight: 'bold',
        color: '#3A6973',
        padding: 0,
        backgroundColor: 'transparent',
        border: 'none',
        borderBottom: '4px solid #e3aaaa', 
        paddingBottom: '10px',
        boxShadow: 'none',
        width: 540,
        height: 30,
      },
    },
      
    {
      id: 'pc',
      type: 'pc',
      data: { label: 'PC' },
      position: { x: 30, y: 550 },
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
      type: 'adder4',
      data: { label: 'Adder 4' },
      position: { x: 440, y: 70 },
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
      type: 'four',
      data: { label: '4' },
      position: { x: 310, y: 37},
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
      type: 'instructionMemory', 
      data: { label: 'Instruction Memory' },
      position: { x: 300, y: 510 },
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

    {
      id: 'imAddressInput',
      type: 'imAddressInputSvg',
      data: { label: 'Address' },
      position: { x: 10, y: 30 },  // Position relative to parent's top-left corner
      parentId: 'instructionMemory',  // Make it a child of instructionMemory
      extent: 'parent',  // Confine it to parent's boundaries
      style: {
        width: 80,
        height: 40,
        backgroundColor: '#f0f8ff',
        border: '1px solid #3a6973',
        borderRadius: 4,
        padding: 0,
        fontSize: '12px',
      },
    },

    {
      id: 'imInstructionOutput',
      type: 'imInstructionOutputSvg',
      data: { label: 'Instruction' },
      position: { x: 10, y: 130 },  // Position relative to parent's top-left corner
      parentId: 'instructionMemory',  // Make it a child of instructionMemory
      extent: 'parent',  // Confine it to parent's boundaries
      style: {
        width: 80,
        height: 40,
        backgroundColor: '#f0f8ff',
        border: '1px solid #3a6973',
        borderRadius: 4,
        padding: 0,
        fontSize: '12px',
      },
    },

    //PIVOTS S1

    //NODE PC-PIVOT-ADDER4
    {
      id: 'pivot1',
      type: 'pivot1',
      data: { label: '' },
      position: { x: 200, y: 435 },
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