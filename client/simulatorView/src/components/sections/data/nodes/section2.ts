/*
* this file contains the nodes of the second section of the simulator
*/

import {
    Node,
  } from '@xyflow/react';


export const section2: Node[] = [
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

     // CHILD NODES SECTION 2
    {
      id: 'controlUnit',
      type: 'controlUnitSvg',
      data: { label: 'Control Unit' },
      position: { x: 280, y: 285 },
      parentId: 'section-2',
      extent: 'parent',
      style: {
        width: 170,
        height: 220,
        backgroundColor: 'transparent',
        border: 'none',
        borderRadius: 0,
        padding: 0,
        boxShadow: 'none',
      },
    },


    {
      id: 'registersUnit',
      type: 'registerUnitSvg',
      data: { label: 'Registers Unit' },
      position: { x: 280, y: 635 },
      parentId: 'section-2',
      extent: 'parent',
      style: {
        width: 240,
        height: 300,
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
      position: { x: 133, y: 1078},
      parentId: 'section-2',
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
      type: 'immGeneratorSvg',
      data: { label: 'Registers Unit' },
      position: { x: 280, y: 1025 },
      parentId: 'section-2',
      extent: 'parent',
      style: {
        width: 240,
        height: 100,
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
      id: 'instMemPivotRU',
      type: 'instMemPivotRU',
      data: { label: '' },
      position: { x: 0, y: 830 },
      parentId: 'section-2',
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