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

import { initialNodes } from './data/nodes/initialNodes'; // Nodes
import { initialEdges } from './data/edges/initialEdges'; //Conecctions between npdes


//Section 1
import PCSvg from '../svgs/section1/PCSVG';
import Adder4Svg from '../svgs/section1/Adder4Svg';
import _4Svg from '../svgs/section1/4Svg';
import InstructionMemorySvg from '../svgs/section1/InstructionMemorySvg'; 


// Section 2
import RegistersUnitSvg from '../svgs/section2/RegistersUnitSvg';
import ControlUnitSvg from '../svgs/section2/ControlUnitSvg';

//pivots
import PcPivotAdder4 from '../svgs/pivots/PcPivotAdder4';
import IMPivotRU from '../svgs/pivots/IMPivotRU';

import AnimatedSVGEdge from '../animate/AnimatedSVGEdge';
import ImmGeneratorSvg from '../svgs/section2/ImmGeneratosSvg';





const nodeTypes = {

  // Section 1
  pcSvg: PCSvg,
  adder4Svg: Adder4Svg,
  instructionMemorySvg: InstructionMemorySvg, 
  fourSvg: _4Svg,

  //Section 2
  registerUnitSvg: RegistersUnitSvg,
  controlUnitSvg: ControlUnitSvg,
  immGeneratorSvg: ImmGeneratorSvg,

  //Pivots
  pcPivotAdder4: PcPivotAdder4,
  instMemPivotRU: IMPivotRU,
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
