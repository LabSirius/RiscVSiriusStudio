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

  //  CHILD NODES SECTION 1
  {
    id: '1a',
    data: { label: 'Node 1-A' },
    position: { x: 30, y: 50 },
    parentId: 'section-1',
    extent: 'parent',
    style: {
      width: 120,
      height: 60,
      fontSize: '16px',
      padding: '10px',
    },
  },

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

  //OTHER SECTIONS (STATIC)

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
    id: '2a',
    data: { label: 'Node 2-A' },
    position: { x: 30, y: 50 },
    parentId: 'section-2',
    extent: 'parent',
    style: {
      width: 120,
      height: 60,
      fontSize: '16px',
      padding: '10px',
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
    id: '3a',
    data: { label: 'Node 3-A' },
    position: { x: 30, y: 50 },
    parentId: 'section-3',
    extent: 'parent',
    style: {
      width: 120,
      height: 60,
      fontSize: '16px',
      padding: '10px',
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
  {
    id: '4a',
    data: { label: 'Node 4-A' },
    position: { x: 30, y: 50 },
    parentId: 'section-4',
    extent: 'parent',
    style: {
      width: 120,
      height: 60,
      fontSize: '16px',
      padding: '10px',
    },
  },

  // OUTSIDE NODE (STATIC)

  {
    id: 'outside-node',
    data: { label: 'Outside Node' },
    position: { x: 548 * 4 + 100, y: 120 },
  },
];

const initialEdges: Edge[] = [

  // CONNECTIONS
  { id: 'e1a-2a', source: '1a', target: '2a', animated: true },
  { id: 'e2a-3a', source: '2a', target: '3a', animated: true },
  { id: 'e3a-4a', source: '3a', target: '4a', animated: true },
  { id: 'e4a-outside', source: '4a', target: 'outside-node', animated: true },
];

const nodeTypes = {
  pcsvg: PCSVG,
};

export default function Sections() {
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback((connection: Connection) => {
    setEdges((eds) => addEdge(connection, eds));
  }, [setEdges]);

  return (
    <ReactFlow
      nodeTypes={nodeTypes}
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
