import { useEffect } from 'react';
import { Edge } from '@xyflow/react';
import { useIR } from '@/context/graphic/IRContext';
import { useMemoryTable } from '@/context/panel/MemoryTableContext';

interface InstructionEffectProps {
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
}

const InstructionEffect: React.FC<InstructionEffectProps> = ({ setEdges }) => {
  const { ir, setCurrentType } = useIR();
  const { newPc } = useMemoryTable();

  useEffect(() => {
    let targetEdges: string[] = [];

    switch (ir.instructions[newPc].type) {
      case "R": {
        console.log("R", ir.instructions[newPc]);
        setCurrentType("R");
        targetEdges = [
          
          //MUX A
          'pivot1->pivotJump1',
          'pivotJump1->pivotJump2',
          'pivotJump2->pivotJump3',
          'pivotJump3->muxA',
          //NO IMM
          'pivot3->immediateGenerator[31:7]',
          'immSrc->immGenerator',
          'immGenerator->pivot10',
          //MUX B
          'pivot10->muxB',

          //NO BRANCHUNIT
          'pivot2->branchUnit',
          'pivot4->branchUnit',
          //NO MEM
          'pivot2->pivot5',
          'pivot5->pivotJump5',
          'pivotJump5->pivot6',
          'pivot6->dataMemory',
          'pivot7->dataMemory',
          'dmWr->dataMemory',
          'dmCtrl->dataMemory',
          
          //MUX C
          'dataMemory->muxC',

          'pivot18->pivotJump8',
          'pivotJump8->pivotJump9',
          'pivotJump9->pivot13',
          'pivot13->muxC',

          //MUXD
          'pivot7->pivot16',
          'pivot16->pivot17',
          'pivot17->muxD',

        ];
        break;
      }
      case "I":
        console.log("I", ir.instructions[newPc]);
        setCurrentType("I");
        break;
      case "S":
        console.log("S", ir.instructions[newPc]);
        setCurrentType("S");
        break;
      case "B":
        console.log("B", ir.instructions[newPc]);
        setCurrentType("B");
        break;
      case "J":
        console.log("J", ir.instructions[newPc]);
        setCurrentType("J");
        break;
      case "U":
        console.log("U", ir.instructions[newPc]);
        setCurrentType("U");
        break;
      default:
        break;
    }

    setEdges((prevEdges: Edge[]) =>
      prevEdges.map((edge) => {
        if (targetEdges.includes(edge.id)) {
          return {
            ...edge,
            style: {
              ...edge.style,
              stroke: '#D3D3D3'
            },
            disabled: true 
          };
        }
        return edge;
      })
    );
  }, [newPc, ir, setCurrentType, setEdges]);

  return null;
};

export default InstructionEffect;
