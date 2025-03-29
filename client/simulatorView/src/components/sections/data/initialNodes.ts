/*
* In this file, we define the initial nodes for the diagram.
* Each node has properties such as id, type, data, position, parentId, extent, and style.
* 
*/

import {
    Node,
  } from '@xyflow/react';


export const initialNodes: Node[] = [
    // SECTIONS (STATIC)
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
  
    // CHILD NODES SECTION 1


    //NODE PC
    {
      id: 'pc',
      type: 'pcSvg',
      data: { label: 'PC' },
      position: { x: 30, y: 710 },
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


    //NODE Adder4
    {
      id: 'adder4',
      type: 'adder4Svg',
      data: { label: 'Adder 4' },
      position: { x: 440, y: 200 },
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
  


    //NODE Four
    {
      id: 'four',
      type: 'fourSvg',
      data: { label: '4' },
      position: { x: 310, y: 170},
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
  
  
    // NODE Instruction Memory
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
      position: { x: 200, y: 280 },
      parentId: 'section-1',
      extent: 'parent',
      style: {
        width: 0.5,
        height: 0.5,
        opacity: 0,
        backgroundColor: 'transparent',
        border: 'none',
        borderRadius: 0,
        padding: 0,
        boxShadow: 'none',
      },
    },


  
    // OTHER SECTIONS (STATIC)
    {
      id: 'section-2',
      type: 'group',
      data: { label: 'Section 2' },
      position: { x: 548, y: 0 },
      draggable: false,
      style: {
        width: 548,
        height: 1200,
        backgroundColor: '#FFF9C4',
        border: '1px solid #eed97f',
        borderRadius: 8,
      },
    },
    
  
    {
      id: 'section-3',
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
      id: 'section-4',
      type: 'group',
      data: { label: 'Section 4' },
      position: { x: 548 * 3, y: 0 },
      draggable: false,
      style: {
        width: 548,
        height: 1200,
        backgroundColor: '#E8F5E9',
        border: '1px solid #b9e8d1',
        borderRadius: 8,
      },
    },
   
  ];