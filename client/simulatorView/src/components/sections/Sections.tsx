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
import PC from '../svgs/section1/PC';
import Adder4 from '../svgs/section1/Adder4';
import Four from '../svgs/section1/Four';
import InstructionMemory from '../svgs/section1/InstructionMemory'; 


// Section 2
import RegistersUnit from '../svgs/section2/RegistersUnit';
import ControlUnit from '../svgs/section2/ControlUnit';

//Section 3
import Mux2_1A from '../svgs/section3/Mux2_1A';
import ALUASrc from '../svgs/section3/ALUASrc';
import Mux2_1B from '../svgs/section3/Mux2_1B';
import ALUBSrc from '../svgs/section3/ALUBSrc';

//pivots
import Pivot1 from '../svgs/pivots/Pivot1';
import Pivot3 from '../svgs/pivots/Pivot3';

import ImmGenerator from '../svgs/section2/ImmGenerator';
import ImmSrc from '../svgs/section2/ImmSrc';

//jumps
import PivotJump1 from '../svgs/pivots/jump/PivotJump1';

//Customs 
import AnimatedSVGEdge from '../customs/AnimatedSVGEdge';

const nodeTypes = {

  // Section 1
  pc: PC,
  adder4: Adder4,
  instructionMemory: InstructionMemory, 
  four: Four,

  //Section 2
  registerUnit: RegistersUnit,
  controlUnit: ControlUnit,
  immGenerator: ImmGenerator,
  immSrc: ImmSrc,

  //Section 3
  mux2_1A: Mux2_1A,
  aluASrc: ALUASrc,
  mux2_1B: Mux2_1B,
  aluBSrc: ALUBSrc,

  //Pivots
  pivot1: Pivot1,
  pivot3: Pivot3,

  //Jumps
  pivotJump1: PivotJump1,
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
