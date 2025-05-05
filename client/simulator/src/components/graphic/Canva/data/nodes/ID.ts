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
    position: { x: 920, y: 0 },
    draggable: false,
    zIndex: 0,
    style: {
      width: 740,
      height: 1375,
      backgroundColor: '#FFF9C4',
      border: '1px solid #FFF9C4',
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
      width: 740,
      height: 50,
      backgroundColor: 'transparent',
      border: 'none',
      borderRadius: 0,
      padding: 0,
      boxShadow: 'none',
    },
  },

  // CHILD NODES SECTION 2
  // {
  //   id: 'controlUnit',
  //   type: 'controlUnit',
  //   data: { label: 'Control Unit' },
  //   position: { x: 255, y: 310 },
  //   parentId: 'ID',
  //   extent: 'parent',
  //   style: {
  //     width: 260,
  //     height: 250,
  //     backgroundColor: 'transparent',
  //     border: 'none',
  //     borderRadius: 0,
  //     padding: 0,
  //     boxShadow: 'none',
  //   },
  // },

  {
    id: 'ruWr',
    type: 'ruWr',
    data: { label: 'RUWR' },
    position: { x: 120, y: 834 },
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
    position: { x: 255, y: 455 },
    parentId: 'ID',
    extent: 'parent',
    style: {
      width: 360,
      height: 450,
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
    position: { x: 145, y: 1048.5 },
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
    position: { x: 285, y: 955.5 },
    parentId: 'ID',
    extent: 'parent',
    style: {
      width: 330,
      height: 150,
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
    position: { x: 680, y: 862.5 },
    parentId: 'ID',
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
    id: 'pivot3',
    type: 'pivot3',
    data: { label: '' },
    position: { x: 50, y: 863 },
    parentId: 'ID',
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
    id: 'pivot5',
    type: 'pivot5',
    data: { label: '' },
    position: { x: 680, y: 1097 },
    parentId: 'ID',
    extent: 'parent',
    style: {
      width: 5,
      height: 5,
      backgroundColor: 'red',
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
    position: { x: 100, y: 1151 },
    parentId: 'ID',
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
    id: 'pivot18',
    type: 'pivot18',
    data: { label: '' },
    position: { x: 50, y: 274 },
    parentId: 'ID',
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
    id: 'pivot19',
    type: 'pivot19',
    data: { label: '' },
    position: { x: 50, y: 148 },
    parentId: 'ID',
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
    id: 'pivot20',
    type: 'pivot20',
    data: { label: '' },
    position: { x: 50, y: 583 },
    parentId: 'ID',
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
    id: 'pivot21',
    type: 'pivot21',
    data: { label: '' },
    position: { x: 50, y: 503 },
    parentId: 'ID',
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
    id: 'pivot22',
    type: 'pivot22',
    data: { label: '' },
    position: { x: 50, y: 663 },
    parentId: 'ID',
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


  //jump
  {
    id: 'pivotJump1',
    type: 'pivotJump1',
    data: { label: 'pivotJump1' },
    position: { x: 34, y: 383 },
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
    position: { x: 664, y: 383 },
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
    position: { x: 664, y: 708 },
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
    id: 'pivotJump5',
    type: 'pivotJump5',
    data: { label: 'pivotJump5' },
    position: { x: 664, y: 1005 },
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
    id: 'pivotJump10',
    type: 'pivotJump10',
    data: { label: 'pivotJump10' },
    position: { x: 34, y: 175 },
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