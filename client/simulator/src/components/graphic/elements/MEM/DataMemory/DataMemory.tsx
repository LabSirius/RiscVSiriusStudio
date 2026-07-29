import { useCurrentInst } from '@/context/graphic/CurrentInstContext';
import { Handle, Position } from '@xyflow/react';
import ContainerSVG from '../../ContainerSVG';
import LabelValueContainer from './LabelValueContainer';
import { useSimulator } from '@/context/shared/SimulatorContext';
import ClockTriangle from '@/components/graphic/ClockTriangle';

interface HandlerConfig {
  id?: string;
  top?: string;
  left?: string;
}

export default function DataMemory() {
  const { currentType, pipelineValuesStages } = useCurrentInst();
  const { operation, isFirstStep, isEbreak, typeSimulator} = useSimulator();

  const inputHandlers: HandlerConfig[] = [
    { id: 'dmWr', left: '5.5rem' },
    { id: 'dmCtrl', left: '14.38rem' },
    { id: 'alu', top: '10rem' },
    { id: 'rs2', top: '15.75rem' },
  ];

  const outputHandlers: HandlerConfig[] = [
    { top: '13.13rem' },
  ];



  const isActive = typeSimulator === "pipeline" ?    pipelineValuesStages.MEM.instruction.type === "S" || (pipelineValuesStages.MEM.instruction.type === "I" && pipelineValuesStages.MEM.instruction.opcode === "0000011") : currentType === "L" || currentType === "S"

  return (
    <div className='w-full'>

      <div className='relative w-full h-full group'>
        <h2 className={`!z-0  titleInElement top-[15%] left-[50%] -translate-x-[50%] -translate-y-[15%] ${!(isActive|| !isFirstStep) && '!text-[#D3D3D3]'  }`}>
          Data Memory
        </h2>
        <ContainerSVG height={19.9} active={isActive} />
        {(operation !== "uploadMemory") && !isEbreak &&isActive && <LabelValueContainer /> }
        <div className="group-hover:translate-y-[-.8rem] transition-all duration-200 ease-in">
          <ClockTriangle />
        </div>
      </div>

      {inputHandlers.map((handler, index) => (
        <Handle
          key={handler.id || `input-${index}`}
          type="target"
          id={handler.id}
          position={handler.left ? Position.Top : Position.Left}
          className="input"
          style={{ top: handler.top, left: handler.left }}
        />
      ))}

      {outputHandlers.map((handler, index) => (
        <Handle
          key={`output-${index}`}
          type="source"
          position={Position.Right}
          className="output"
          style={{ top: handler.top }}
        />
      ))}
      
    </div>
  );
}
