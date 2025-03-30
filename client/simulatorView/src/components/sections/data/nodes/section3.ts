/*
* this file contains the nodes of the second section of the simulator
*/

import {
    Node,
  } from '@xyflow/react';


export const section3: Node[] = [
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
        id: 'muxA',
        type: 'muxA',
        data: { label: 'MUX A' },
        position: { x: 100, y: 430 },
        parentId: 'section-3',
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
        position: { x: 100, y: 325 },
        parentId: 'section-3',
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
        id: 'mux2B',
        type: 'mux2B',
        data: { label: 'MUX B' },
        position: { x: 100, y: 625 },
        parentId: 'section-3',
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
        position: { x: 100, y: 725 },
        parentId: 'section-3',
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


    //PIVOTS S3
    //NODE PC-PIVOT1-PIVOTJUMP1-PIVOT2-MUXA
    {
      id: 'pivot2',
      type: 'pivot2',
      data: { label: '' },
      position: { x: 30, y: 436 },
      parentId: 'section-3',
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



    
   
  ];