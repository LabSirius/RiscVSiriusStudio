import { useCallback, useState, MouseEvent } from 'react';
import {
  ReactFlow,
  Edge,
  useReactFlow,
  addEdge,
  Background,
  useNodesState,
  useEdgesState,
  MiniMap,
  Connection,
  ReactFlowInstance
  
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { initialNodes } from './data/nodes/initialNodes'; // Nodes
import { initialEdges } from './data/edges/initialEdges'; //Conecctions between npdes

import TitleText from '../elements/TittleText';

//Section 1
import PC from '../elements/IF/PC';
import Adder4 from '../elements/IF/Adder4';
import Four from '../elements/IF/Four';
import InstructionMemory from '../elements/IF/InstructionMemory';
import MuxD from '../elements/IF/MuxD';


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
import Pivot13 from '../elements/WB/pivots/Pivot13';
import Pivot14 from '../elements/MEM/pivots/Pivot14';
import Pivot15 from '../elements/IF/pivots/Pivot15';
import Pivot16 from '../elements/MEM/pivots/Pivot16';
import Pivot17 from '../elements/IF/pivots/Pivot17';
import Pivot18 from '../elements/ID/pivots/Pivot18';
import Pivot19 from '../elements/ID/pivots/Pivot19';
import Pivot20 from '../elements/ID/pivots/Pivot20';
import Pivot21 from '../elements/ID/pivots/Pivot21';
import Pivot22 from '../elements/ID/pivots/Pivot22';
import Pivot23 from '../elements/ID/pivots/Pivot23';
import Pivot24 from '../elements/ID/pivots/Pivot24';
import Pivot25 from '../elements/IF/pivots/Pivot25';


//jumps
import PivotJump1 from '../elements/ID/pivots/PivotJump1';
import PivotJump2 from '../elements/ID/pivots/PivotJump2';
import PivotJump3 from '../elements/IE/pivots/PivotJump3';
import PivotJump4 from '../elements/ID/pivots/PivotJump4';
import PivotJump5 from '../elements/IE/pivots/PivotJump5';
import PivotJump6 from '../elements/MEM/pivots/PivotJum6';
import PivotJump7 from '../elements/IE/pivots/PivotJump7';
import PivotJump8 from '../elements/MEM/pivots/PivotJum8';
import PivotJump9 from '../elements/MEM/pivots/PivotJum9';
import PivotJump10 from '../elements/ID/pivots/PivotJump10';

//Customs 
import AnimatedSVGEdge from '../ui/custom/AnimatedSVGEdge';
import CustomControls from '../ui/custom/CustomControls';


import { animateLine } from '../animateLine/animateLine';


const nodeTypes = {

  title: TitleText,
  // IF
  pc: PC,
  adder4: Adder4,
  instructionMemory: InstructionMemory,
  four: Four,
  muxD: MuxD,

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
  pivot13: Pivot13,
  pivot14: Pivot14,
  pivot15: Pivot15,
  pivot16: Pivot16,
  pivot17: Pivot17,
  pivot18: Pivot18,
  pivot19: Pivot19,
  pivot20: Pivot20,
  pivot21: Pivot21,
  pivot22: Pivot22,
  pivot23: Pivot23,
  pivot24: Pivot24,
  pivot25: Pivot25,

  //PIVOTS Jumps
  pivotJump1: PivotJump1,
  pivotJump2: PivotJump2,
  pivotJump3: PivotJump3,
  pivotJump4: PivotJump4,
  pivotJump5: PivotJump5,
  pivotJump6: PivotJump6,
  pivotJump7: PivotJump7,
  pivotJump8: PivotJump8,
  pivotJump9: PivotJump9,
  pivotJump10: PivotJump10,
};

const edgeTypes = {
  animatedSvg: AnimatedSVGEdge,
};

export default function Canva() {
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [showMinimap, setShowMinimap] = useState(false);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const [isInteractive, setIsInteractive] = useState(true); 
  const { updateEdge } = useReactFlow();

  const onConnect = useCallback(
    (connection: Connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges]
  );

  const handleFitView = () => {
    reactFlowInstance?.fitView({ padding: 0.01 });
  };

  const handleZoomIn = () => {
    reactFlowInstance?.zoomIn?.();
  };

  const handleZoomOut = () => {
    reactFlowInstance?.zoomOut?.();
  };

  const handleToggleInteractive = () => {
    setIsInteractive((prev) => !prev);
  };


  const handleEdgeMouseEnter = (
    _event: MouseEvent<Element>, 
    edge: Edge
  ): void => {
    animateLine(updateEdge, edge, true);
  };
  
  const handleEdgeMouseLeave = (
    _event: MouseEvent<Element>, 
    edge: Edge
  ): void => {
    animateLine(updateEdge, edge, false);
  };

  return (
    <ReactFlow
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      onEdgeMouseEnter={handleEdgeMouseEnter}
      onEdgeMouseLeave={handleEdgeMouseLeave}
      nodes={nodes}
      onInit={(instance) => {
        setReactFlowInstance(instance);
        instance.fitView({ padding: 0.01 });
      }}
      fitView={false}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      style={{ backgroundColor: '#F7F9FB' }}
      minZoom={0.1}
      maxZoom={2}
      panOnDrag={isInteractive} 
      elementsSelectable={isInteractive} 
    >
      <Background color="#FF0000" gap={20} size={2} />
      {showMinimap && <MiniMap />}
      <CustomControls
        onFitView={handleFitView}
        onToggleMinimap={() => setShowMinimap((prev) => !prev)}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onToggleInteractive={handleToggleInteractive}
      />
    </ReactFlow>
  );
}
