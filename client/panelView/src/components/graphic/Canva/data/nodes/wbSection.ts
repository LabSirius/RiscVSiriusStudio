/*
* this file contains the nodes of the second section of the simulator
*/

import {
  Node,
} from '@xyflow/react';


export const section5: Node[] = [
  {
    id: 'section-5',
    type: 'group',
    data: { label: 'Section 5' },
    position: { x: 548 * 4, y: 0 },
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
    id: 'write-back-title',
    type: 'titleText',
    data: { label: 'Write back (WB)' },
    position: { x: 0, y: 10 },
    parentId: 'section-5',
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
  }

];