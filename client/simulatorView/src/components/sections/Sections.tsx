import { useCallback, useState } from 'react';
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

//import TitleText from '../elements/TittleText';

//Section 1
import PC from '../elements/IF/PC';
import Adder4 from '../elements/IF/Adder4';
import Four from '../elements/IF/Four';
import InstructionMemory from '../elements/IF/InstructionMemory';


// Section 2
import RegistersUnit from '../elements/ID/RegistersUnit';
import ControlUnit from '../elements/ID/ControlUnit/ControlUnit';
import RUWr from '../elements/ID/RUWr';
import ImmGenerator from '../elements/ID/ImmGenerator';
import ImmSrc from '../elements/ID/ImmSRC';

//Section 3
import MuxA from '../elements/IE/MuxA';
import ALUASrc from '../elements/IE/ALUASrc';
import MuxB from '../elements/IE/MuxB';
import ALUBSrc from '../elements/IE/ALUBSrc';
import ALU from '../elements/IE/ALU';
import ALUOp from '../elements/IE/ALUOp';
import BranchUnit from '../elements/IE/BranchUnit';
import BrOp from '../elements/IE/BrOp';


//Section 4
import DataMemory from '../elements/MEM/DataMemory';
import DMWR from '../elements/MEM/DMWr';
import DMCtrl from '../elements/MEM/DMCtrl';

//Section 5
import MuxC from '../elements/WB/MuxC';
import RUDataWrSrc from '../elements/WB/RUDataWrSrc';

//pivots
import Pivot1 from '../elements/IF/pivots/Pivot1';
import Pivot2 from '../elements/ID/pivots/Pivot2';
import Pivot3 from '../elements/ID/pivots/Pivot3';
import Pivot4 from '../elements/IE/pivots/Pivot4';
import Pivot5 from '../elements/ID/pivots/Pivot5';
import Pivot6 from '../elements/MEM/pivots/Pivot6';
import Pivot7 from '../elements/MEM/pivots/Pivot7';
import Pivot8 from '../elements/MEM/pivots/Pivot8';
import Pivot9 from '../elements/WB/pivots/Pivot9';
import Pivot10 from '../elements/IE/pivots/Pivot10';
import Pivot11 from '../elements/WB/pivots/Pivot11';
import Pivot12 from '../elements/ID/pivots/Pivot12';

//jumps
import PivotJump1 from '../elements/ID/pivots/PivotJump1';
import PivotJump2 from '../elements/ID/pivots/PivotJump2';
import PivotJump3 from '../elements/IE/pivots/PivotJump3';
import PivotJump4 from '../elements/ID/pivots/PivotJump4';
import PivotJump5 from '../elements/IE/pivots/PivotJump5';
import PivotJump6 from '../elements/MEM/pivots/PivotJum6';
import PivotJump7 from '../elements/IE/pivots/PivotJump7';

//Customs 
import AnimatedSVGEdge from '../custom/AnimatedSVGEdge';
import CustomControls from '../custom/CustomControls';



const nodeTypes = {

  //title: TitleText,
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
  ruWr: RUWr,

  //IE
  muxA: MuxA,
  aluASrc: ALUASrc,
  muxB: MuxB,
  aluBSrc: ALUBSrc,
  alu: ALU,
  aluOp: ALUOp,
  branchUnit: BranchUnit,
  brOp: BrOp,

  //MEM
  dataMemory: DataMemory,
  dmWr: DMWR,
  dmCtrl: DMCtrl,

  //WB
  muxC: MuxC,
  ruDataWrSrc: RUDataWrSrc,

  //PITOVS
  pivot1: Pivot1,
  pivot2: Pivot2,
  pivot3: Pivot3,
  pivot4: Pivot4,
  pivot5: Pivot5,
  pivot6: Pivot6,
  pivot7: Pivot7,
  pivot8: Pivot8,
  pivot9: Pivot9,
  pivot10: Pivot10,
  pivot11: Pivot11,
  pivot12: Pivot12,

  //PIVOTS Jumps
  pivotJump1: PivotJump1,
  pivotJump2: PivotJump2,
  pivotJump3: PivotJump3,
  pivotJump4: PivotJump4,
  pivotJump5: PivotJump5,
  pivotJump6: PivotJump6,
  pivotJump7: PivotJump7,
};

const edgeTypes = {
  animatedSvg: AnimatedSVGEdge,
};

export default function Sections() {
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  // Add state for minimap visibility
  const [showMinimap, setShowMinimap] = useState(false);

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
      {/* Conditionally render the MiniMap based on state */}
      {showMinimap && <MiniMap />}
      {/* Pass the toggle function to CustomControls */}
      <CustomControls onToggleMinimap={() => setShowMinimap(!showMinimap)} />
    </ReactFlow>
  );
}
