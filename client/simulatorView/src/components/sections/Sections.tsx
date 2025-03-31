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

import TitleText from '../elements/TittleText';

//Section 1
import PC from '../elements/section1/PC';
import Adder4 from '../elements/section1/Adder4';
import Four from '../elements/section1/Four';
import InstructionMemory from '../elements/section1/InstructionMemory'; 


// Section 2
import RegistersUnit from '../elements/section2/RegistersUnit';
import ControlUnit from '../elements/section2/ControlUnit';

//Section 3
import MuxA from '../elements/section3/MuxA';
import ALUASrc from '../elements/section3/ALUASrc';
import MuxB from '../elements/section3/MuxB';
import ALUBSrc from '../elements/section3/ALUBSrc';
import ALU from '../elements/section3/ALU';
import ALUOp from '../elements/section3/ALUOp';
import BranchUnit from '../elements/section3/BranchUnit';
import BrOp from '../elements/section3/BrOp';

//pivots
import Pivot1 from '../elements/pivots/Pivot1';
import Pivot2 from '../elements/pivots/Pivot2';
import Pivot3 from '../elements/pivots/Pivot3';
import Pivot4 from '../elements/pivots/Pivot4';

import ImmGenerator from '../elements/section2/ImmGenerator';
import ImmSrc from '../elements/section2/ImmSRC';

//jumps
import PivotJump1 from '../elements/pivots/jump/PivotJump1';
import PivotJump2 from '../elements/pivots/jump/PivotJump2';
import PivotJump3 from '../elements/pivots/jump/PivotJump3';
import PivotJump4 from '../elements/pivots/jump/PivotJump4';



//Customs 
import AnimatedSVGEdge from '../custom/AnimatedSVGEdge';
import CustomControls from '../custom/CustomControls';


const nodeTypes = {

  title: TitleText,
  // IF
  pc: PC,
  adder4: Adder4,
  instructionMemory: InstructionMemory, 
  four: Four,

  //ID
  registerUnit: RegistersUnit,
  controlUnit: ControlUnit,
  immGenerator: ImmGenerator,
  immSrc: ImmSrc,

  //IE
  muxA: MuxA,
  aluASrc: ALUASrc,
  muxB: MuxB,
  aluBSrc: ALUBSrc,
  alu: ALU,
  aluOp: ALUOp,
  branchUnit: BranchUnit,
  brOp: BrOp,

  //PITOVS
  pivot1: Pivot1,
  pivot2: Pivot2,
  pivot3: Pivot3,
  pivot4: Pivot4,

  //PIVOTS Jumps
  pivotJump1: PivotJump1,
  pivotJump2: PivotJump2,
  pivotJump3: PivotJump3,
  pivotJump4: PivotJump4,
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
         //variant='cross'
         gap={20}
         size={2} />
      <MiniMap />
      <CustomControls />
    </ReactFlow>
  );
}
