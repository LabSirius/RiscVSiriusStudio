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
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { initialNodes } from './data/initialNodes'; // Nodes
import { initialEdges } from './data/initialEdges'; //Conecctions between npdes

import PCSVG from '../svgs/section1/PCSVG';
import Adder4SVG from '../svgs/section1/Adder4Svg';
import _4Svg from '../svgs/section1/4Svg';
import InstructionMemorySvg from '../svgs/section1/InstructionMemorySvg'; 

//pivots
import PcPivotAdder4 from '../svgs/pivots/PcPivotAdder4';

import AnimatedSVGEdge from '../animate/AnimatedSVGEdge';




const nodeTypes = {
  pcSvg: PCSVG,
  adder4Svg: Adder4SVG,
  instructionMemorySvg: InstructionMemorySvg, 
  fourSvg: _4Svg,

  //Pivots
  pcPivotAdder4: PcPivotAdder4,
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
