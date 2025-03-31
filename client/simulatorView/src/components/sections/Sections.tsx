import { useCallback } from 'react';
import {
  ReactFlow,
  addEdge,
  Background,
  useNodesState,
  useEdgesState,
  MiniMap,
  Connection,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { initialNodes } from './data/nodes/initialNodes'; // Nodes
import { initialEdges } from './data/edges/initialEdges'; //Conecctions between npdes

import TitleText from '../svgs/TittleText';

//Section 1
import PC from '../svgs/section1/PC';
import Adder4 from '../svgs/section1/Adder4';
import Four from '../svgs/section1/Four';
import InstructionMemory from '../svgs/section1/InstructionMemory'; 


// Section 2
import RegistersUnit from '../svgs/section2/RegistersUnit';
import ControlUnit from '../svgs/section2/ControlUnit';

//Section 3
import MuxA from '../svgs/section3/MuxA';
import ALUASrc from '../svgs/section3/ALUASrc';
import MuxB from '../svgs/section3/MuxB';
import ALUBSrc from '../svgs/section3/ALUBSrc';
import ALU from '../svgs/section3/ALU';
import ALUOp from '../svgs/section3/ALUOp';
import BranchUnit from '../svgs/section3/BranchUnit';

//pivots
import Pivot1 from '../svgs/pivots/Pivot1';
import Pivot2 from '../svgs/pivots/Pivot2';
import Pivot3 from '../svgs/pivots/Pivot3';
import Pivot4 from '../svgs/pivots/Pivot4';

import ImmGenerator from '../svgs/section2/ImmGenerator';
import ImmSrc from '../svgs/section2/ImmSRC';

//jumps
import PivotJump1 from '../svgs/pivots/jump/PivotJump1';
import PivotJump2 from '../svgs/pivots/jump/PivotJump2';
import PivotJump3 from '../svgs/pivots/jump/PivotJump3';



//Customs 
import AnimatedSVGEdge from '../customs/AnimatedSVGEdge';
import CustomControls from '../customs/CustomControls';


const nodeTypes = {

  title: TitleText,
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
  muxA: MuxA,
  aluASrc: ALUASrc,
  muxB: MuxB,
  aluBSrc: ALUBSrc,
  alu: ALU,
  aluOp: ALUOp,
  branchUnit: BranchUnit,

  //Pivots
  pivot1: Pivot1,
  pivot2: Pivot2,
  pivot3: Pivot3,
  pivot4: Pivot4,

  //Jumps
  pivotJump1: PivotJump1,
  pivotJump2: PivotJump2,
  pivotJump3: PivotJump3,
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
      minZoom={0.1}    
      maxZoom={2}       
    >
      <Background 
         //color="#E6E6E6"
         color="#FF0000"
         variant='cross'
         gap={20}
         size={2} />
      <MiniMap />
      <CustomControls />
    </ReactFlow>
  );
}
