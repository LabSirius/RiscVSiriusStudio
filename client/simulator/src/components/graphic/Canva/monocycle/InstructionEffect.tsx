import { useEffect, useRef } from 'react';
import { Edge } from '@xyflow/react';
import { useCurrentInst } from '@/context/graphic/CurrentInstContext';

interface InstructionEffectProps {
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
}


const skipFunct7Edges = [
  'pivot30->pivot32',
  'pivot32->pivot33'
]

const skipFunct3Edges = [
  'pivot28->pivot30',
  'pivot30->pivot31'
]

// output edge groups for MUX A route
const skipMuxAOutputEdges = [
  'uxA->alu'
]

// Edge groups for skipping MUX A route
const skipMuxA = [
  'aluASrc->muxA',
  'muxA->alu'
]

// Edge groups for MUX A route
const muxARouteEdges = [
  'pivot1->pivotJump2',
  'pivotJump2->pivotJump3',
  'pivotJump3->muxA'
];

// Edge groups for no immediate generation
const noImmediateEdges = [
  'pivot26->pivotJump1',
  'pivotJump1->immediateGenerator[31:7]',
  'immSrc->immGenerator',
  'immGenerator->pivotJump5',
  'pivotJump5->pivot10'
];

// Edge groups for MUX B route for R-type instructions
const muxBRouteEdges_R = ['pivot10->muxB'];

// Edge groups for MUX B route for I-type instructions and others
const muxBRouteEdges_I = [
  'registersUnit->pivot2',
  'pivot2->muxB'
];

// Edge groups for bypassing the branch unit
const bypassBranchUnitEdges = [
  'pivot2->branchUnit',
  'pivot4->branchUnit',
];

// Edge groups for memory access (read) route
const memoryReadEdges = [
  'pivot2->pivot5',
  'pivot5->pivot6',
  'pivot6->dataMemory',
  'pivot7->dataMemory',
  'dmWr->dataMemory',
  'dmCtrl->dataMemory'
];

// Edge groups for MUX C route for R-type instructions
const muxCRouteEdges_R = [
  'dataMemory->muxC',
  'pivot18->pivotJump8',
  'pivotJump8->pivotJump9',
  'pivotJump9->pivot13',
  'pivot13->muxC'
];

// Edge groups for MUX D route for R-type instructions
const muxDRouteEdges_R = [
  'pivot7->pivot16',
  'pivot16->pivot17',
  'pivot17->muxD'

];

// Edge groups for skipping the funct7 field

// Edge groups for skipping the funct3 field

// Edge groups for skipping RS2 register
const skipRS1InputEdges = ['pivot20->pivot21' ,'pivot21->RegistersUnit[19:15]'];
const skipRS1Edges = ['pivot20->RegistersUnit[19:15]', 'registersUnit->pivotJump4', 'pivotJump4->pivot4', 'pivot4->muxA'];
// Edge groups for skipping RS2 register
const skipRS2Edges = ['pivot20->RegistersUnit[24:20]'];

const skipRDEdges = ['pivot22->registersUnit[11:7]'];

// Additional edge groups for the MUX C route in load instructions (L-type)
const muxCRouteExtraEdges_L = [
  'pivot7->pivot8',
  'pivot8->pivotJump6',
  'pivotJump6->pivot9',
  'pivot9->muxC'
];

// Edge groups for skipping RS2 in data memory access
const skipRS2MemoryEdges = [
  'pivot2->pivot5',
  'pivot5->pivot6',
  'pivot6->dataMemory'
];

// Edge groups for the MUX D route in JALR instructions
const muxDRouteEdges_JALR = [
  'pivot18->pivot19',
  'pivot19->muxD'
];

// Additional edge groups for the MUX C route in JALR instructions
const muxCRouteExtraEdges_JALR = [
  'dataMemory->muxC',
  'pivot7->pivot8',
  'pivot8->pivotJump6',
  'pivotJump6->pivot9',
  'pivot9->muxC'
];

// Edge groups for bypassing the write-back stage
const bypassWriteBackEdges = [
  'dataMemory->muxC',
  'pivot7->pivot8',
  'pivot8->pivotJump6',
  'pivotJump6->pivot9',
  'pivot9->muxC',
  'muxC->pivot11',
  'pivot11->pivot12',
  'pivot12->registersUnit',
  'ruWr->registersUnit',
  'ruDataWrSrc->muxC',
  ...muxCRouteEdges_R
];

// Complete memory access group reusing memory read edges
const fullMemoryAccessEdges = memoryReadEdges;

const InstructionEffect: React.FC<InstructionEffectProps> = ({ setEdges }) => {
  const { currentInst, setCurrentType, currentResult } = useCurrentInst();

  const previousTargetEdgesRef = useRef<string[]>([]);

  useEffect(() => {
    let targetEdges: string[] = [];
    const currentInstruction =  currentInst;
    switch (currentInstruction.type) {
      case "R":
        setCurrentType("R");
        targetEdges = [
          ...muxARouteEdges,
          ...noImmediateEdges,
          ...muxBRouteEdges_R,
          ...bypassBranchUnitEdges,
          ...memoryReadEdges,
          ...muxCRouteEdges_R,
          ...muxDRouteEdges_R,
        ];
        break;
      case "I":
        if (currentInstruction.opcode === "0010011") {
          setCurrentType("I");
          targetEdges = [
            ...skipFunct7Edges,
            ...skipRS2Edges,
            ...muxARouteEdges,
            ...muxBRouteEdges_I,
            ...muxCRouteEdges_R,
            ...muxDRouteEdges_R,
            ...bypassBranchUnitEdges,
            ...memoryReadEdges,
          ];
        } else if (currentInstruction.opcode === "0000011") {
          setCurrentType("L");
          targetEdges = [
            ...skipFunct7Edges,
            ...skipRS2Edges,
            ...muxARouteEdges,
            ...muxBRouteEdges_I,
            ...muxCRouteEdges_R.slice(1),
            ...muxCRouteExtraEdges_L,
            ...muxDRouteEdges_R,
            ...bypassBranchUnitEdges,
            ...skipRS2MemoryEdges,
          ];
        } else if (currentInstruction.opcode === "1100111") {
          setCurrentType("JALR");
          targetEdges = [
            ...skipFunct7Edges,
            ...skipRS2Edges,
            ...muxARouteEdges,
            ...muxBRouteEdges_I,
            ...muxCRouteExtraEdges_JALR,
            ...muxDRouteEdges_JALR,
            ...bypassBranchUnitEdges,
            ...fullMemoryAccessEdges,
          ];
        }
        break;
      case "S":
        setCurrentType("S");
        targetEdges = [
          ...skipFunct7Edges,
          ...skipRDEdges,
          ...muxARouteEdges,
          ...muxBRouteEdges_I.slice(1),
          ...muxCRouteEdges_R,
          ...muxCRouteExtraEdges_L,
          ...muxDRouteEdges_R,
          ...bypassBranchUnitEdges,
          ...bypassWriteBackEdges
        ];
        break;
      case "B":
        setCurrentType("B");

        targetEdges = [
          ...skipFunct7Edges,
          ...skipRDEdges,
          // Modified MUX A route for branch instructions
          'pivot4->muxA',
          ...muxBRouteEdges_I.slice(1),
          ...memoryReadEdges,
          ...bypassWriteBackEdges
        ];

        if(currentResult.buMux.signal === '0'){
          targetEdges = [
            ...targetEdges,
            ...muxDRouteEdges_R,
            'alu->pivot7'
          ]
        }else{
          targetEdges = [
            'adder4->pivot18',
            ...targetEdges,
            ...muxDRouteEdges_JALR,
          ]
        }
        break;
      case "J":
        setCurrentType("J");
        targetEdges = [
          ...skipFunct7Edges,
          ...skipFunct3Edges,
          ...skipRS1Edges,
          ...skipRS1InputEdges,
          'pivot22->pivot20',
          ...skipRS2Edges,
          ...muxBRouteEdges_I,
          ...muxCRouteExtraEdges_JALR,
          ...muxDRouteEdges_JALR,
          ...bypassBranchUnitEdges,
          ...fullMemoryAccessEdges,
        ];
        break;
      case "U":
        if (currentInstruction.opcode === "0110111") {
          setCurrentType("LUI");
          targetEdges = [
            ...skipFunct7Edges,
            ...skipFunct3Edges,
            ...skipRS2Edges,
            'pivot22->pivot20',
            ...skipRS1InputEdges,
            ...skipRS1Edges,
            ...muxARouteEdges,
            ...skipMuxA,
            ...skipMuxAOutputEdges,
            ...muxBRouteEdges_I,
            ...muxCRouteEdges_R,
            ...muxDRouteEdges_R,
            ...bypassBranchUnitEdges,
            ...memoryReadEdges,
          ];
        } else if (currentInstruction.opcode === "0010111") {
          setCurrentType("AUIPC");
          targetEdges = [
            ...skipFunct7Edges,
            ...skipFunct3Edges,
            ...skipRS2Edges,
            'pivot22->pivot20',
            ...skipRS1InputEdges,
            ...skipRS1Edges,
            ...skipMuxAOutputEdges,
            ...muxBRouteEdges_I,
            ...muxCRouteEdges_R,
            ...muxDRouteEdges_R,
            ...bypassBranchUnitEdges,
            ...memoryReadEdges,
          ];
        }
        
        break;
      default:
        break;
    }


   

    setEdges(prevEdges => {
      const resetEdges = prevEdges.map(edge => {
        if (
          previousTargetEdgesRef.current.includes(edge.id) &&
          !targetEdges.includes(edge.id)
        ) {
          return {
            ...edge,
            disabled: false,
            style: {
              ...edge.style,
              stroke: "#3B59B6"
            }
          };
        }
        return edge;
      });
      const newEdges = resetEdges.map(edge => {
        if (targetEdges.includes(edge.id)) {
          return {
            ...edge,
            disabled: true,
            style: {
              ...edge.style,
              stroke: "#D3D3D3"
            }
          };
        }
        return edge;
      });
      return newEdges;
    });

    previousTargetEdgesRef.current = targetEdges;
  }, [currentInst, setCurrentType, setEdges]);

  return null;
};

export default InstructionEffect;
