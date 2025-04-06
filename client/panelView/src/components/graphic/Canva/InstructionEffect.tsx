import { useEffect, useRef } from 'react';
import { Edge } from '@xyflow/react';
import { useIR } from '@/context/graphic/IRContext';
import { useMemoryTable } from '@/context/panel/MemoryTableContext';

interface InstructionEffectProps {
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
}

// COMUN EDGES
const MUX_A = [
  'pivot1->pivotJump1',
  'pivotJump1->pivotJump2',
  'pivotJump2->pivotJump3',
  'pivotJump3->muxA'
];

const NO_IMM = [
  'pivot3->immediateGenerator[31:7]',
  'immSrc->immGenerator',
  'immGenerator->pivot10'
];

const MUX_B_R = ['pivot10->muxB'];
const MUX_B_I = ['registersUnit->pivot2', 'pivot2->muxB'];

const NO_BRANCH_UNIT = [
  'pivot2->branchUnit',
  'pivot4->branchUnit',
  'ruDataWrSrc->muxC'
];

const NO_MEM_R = [
  'pivot2->pivot5',
  'pivot5->pivotJump5',
  'pivotJump5->pivot6',
  'pivot6->dataMemory',
  'pivot7->dataMemory',
  'dmWr->dataMemory',
  'dmCtrl->dataMemory'
];

const MUX_C_R = [
  'dataMemory->muxC',
  'pivot18->pivotJump8',
  'pivotJump8->pivotJump9',
  'pivotJump9->pivot13',
  'pivot13->muxC'
];

const MUX_D_R = [
  'pivot7->pivot16',
  'pivot16->pivot17',
  'pivot17->muxD'
];

// I
const NO_FUNT7 = ['pivot22->controlUnit[31:25]'];
const NO_RS2 = ['pivot20->RegistersUnit[24:20]'];

const MUX_C_L_EXTRA = [
  'pivot7->pivot8',
  'pivot8->pivotJump6',
  'pivotJump6->pivot9',
  'pivot9->muxC'
];

const NO_RS2_DM = [
  'pivot2->pivot5',
  'pivot5->pivotJump5',
  'pivotJump5->pivot6',
  'pivot6->dataMemory'
];

const MUX_D_JALR = ['pivot18->pivot19', 'pivot19->muxD'];

const MUX_C_JALR_EXTRA = [
  'dataMemory->muxC',
  'pivot7->pivot8',
  'pivot8->pivotJump6',
  'pivotJump6->pivot9',
  'pivot9->muxC'
];

const NO_WB = [
  'muxC->pivot11',
  'pivot11->pivotJump7',
  'pivotJump7->pivot12',
  'pivot12->registersUnit',
  'ruWr->registersUni'
]

const NO_MEM_FULL = NO_MEM_R; // Assuming this is the same as NO_MEM_R

const InstructionEffect: React.FC<InstructionEffectProps> = ({ setEdges }) => {
  const { ir, setCurrentType } = useIR();
  const { newPc } = useMemoryTable();
  
  const prevTargetEdgesRef = useRef<string[]>([]);

  useEffect(() => {
    let targetEdges: string[] = [];
    const currentInstruction = ir.instructions[newPc];
    console.log(currentInstruction.type, currentInstruction);
    
    switch (currentInstruction.type) {
      case "R":
        setCurrentType("R");
        targetEdges = [
          ...MUX_A,
          ...NO_IMM,
          ...MUX_B_R,
          ...NO_BRANCH_UNIT,
          ...NO_MEM_R,
          ...MUX_C_R,
          ...MUX_D_R,
        ];
        break;
      case "I":
        if (currentInstruction.opcode === "0010011") {
          setCurrentType("I");
          targetEdges = [
            ...NO_FUNT7,
            ...NO_RS2,
            ...MUX_A,
            ...MUX_B_I,
            ...MUX_C_R,
            ...MUX_D_R,
            ...NO_BRANCH_UNIT,
            ...NO_MEM_R,
          ];
        } else if (currentInstruction.opcode === "0000011") {
          setCurrentType("L");
          targetEdges = [
            ...NO_FUNT7,
            ...NO_RS2,
            ...MUX_A,
            ...MUX_B_I,
            ...MUX_C_R.slice(1),
            ...MUX_C_L_EXTRA,
            ...MUX_D_R,
            ...NO_BRANCH_UNIT,
            ...NO_RS2_DM,
          ];
        } else if (currentInstruction.opcode === "1100111") {
          setCurrentType("JALR");
          targetEdges = [
            ...NO_FUNT7,
            ...NO_RS2,
            ...MUX_A,
            ...MUX_B_I,
            ...MUX_C_JALR_EXTRA,
            ...MUX_D_JALR,
            ...NO_BRANCH_UNIT,
            ...NO_MEM_FULL,
          ];
        }
        break;
      case "S":
        setCurrentType("S");
        targetEdges = [
            ...NO_FUNT7,
            ...NO_RS2,
            ...MUX_A,
            ...MUX_B_I.slice(1),
            ...MUX_C_R,
            ...MUX_C_L_EXTRA,
            ...MUX_D_R,
            ...NO_BRANCH_UNIT,
            ...NO_WB
        ];
        break;
        break;
      case "B":
        setCurrentType("B");
        break;
      case "J":
        setCurrentType("J");
        break;
      case "U":
        setCurrentType("U");
        break;
      default:
        break;
    }

    setEdges(prevEdges => {
      const resetEdges = prevEdges.map(edge => {
        if (prevTargetEdgesRef.current.includes(edge.id) && !targetEdges.includes(edge.id)) {
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

    prevTargetEdgesRef.current = targetEdges;
  }, [newPc, ir, setCurrentType, setEdges]);

  return null;
};

export default InstructionEffect;
