import { useCallback } from 'react';
import {
  ReactFlow,
  addEdge,
  Background,
  useNodesState,
  useEdgesState,
  MiniMap,
  Controls,
  Connection,
  Node,
  Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import PCSVG from './svgs/PCSVG';
import InstructionMemorySvg from './svgs/InstructionMemorySvg'; 

import AnimatedSVGEdge from './animate/AnimatedSVGEdge';

const initialNodes: Node[] = [
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

  {
    id: 'pcsvg',
    type: 'pcsvg',
    data: { label: 'PCSVG' },
    position: { x: 30, y: 150 },
    parentId: 'section-1',
    extent: 'parent',
    style: {
      width: 110,
      height: 140,
      backgroundColor: 'transparent',
      border: 'none',
      borderRadius: 0,
      padding: 0,
      boxShadow: 'none',
    },
  },

  

  // NODE: Instruction Memory SVG in Section 1
  {
    id: 'instructionMemory',
    type: 'instructionMemorySvg', 
    data: { label: 'Instruction Memory' },
    position: { x: 30, y: 320 },
    parentId: 'section-1',
    extent: 'parent',
    style: {
      width: 230,
      height: 260,
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

const initialEdges: Edge[] = [
  // CONNECTIONS
  { id: 'pc-to-memory',  source: 'pcsvg', target: 'instructionMemory', type: 'animatedSvg', animated: true,
  },
];

const nodeTypes = {
  pcsvg: PCSVG,
  instructionMemorySvg: InstructionMemorySvg, 
};

const edgeTypes = {
  animatedSvg: AnimatedSVGEdge,
};

export default function Sections() {
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (connection: Connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges]
  );

  return (
    <ReactFlow
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      style={{ backgroundColor: '#F7F9FB' }}
      fitView
    >
      <Background color="#E6E6E6" />
      <MiniMap />
      <Controls />
    </ReactFlow>
  );
}
