import { useCurrentInst } from '@/context/graphic/CurrentInstContext';
import { Handle, Position } from '@xyflow/react';
import ContainerSVG from '../../ContainerSVG';
import LabelValueContainer from './LabelValueContainer';

interface HandlerConfig {
  id?: string;
  top?: string;
  left?: string;
}

export default function DataMemory() {
  const { currentType } = useCurrentInst();

  const inputHandlers: HandlerConfig[] = [
    { id: 'dmWr', left: '5.5rem' },
    { id: 'dmCtrl', left: '14.38rem' },
    { id: 'alu', top: '10rem' },
    { id: 'rs2', top: '15.75rem' },
  ];

  const outputHandlers: HandlerConfig[] = [
    { top: '13.13rem' },
  ];

  return (
    <div className='w-full'>

      <div className='relative w-full h-full'>
        <h2 className="titleInElement top-[15%] left-[50%] -translate-x-[50%] -translate-y-[15%]">
          Data Memory
        </h2>
        <ContainerSVG height={19.9} active={currentType === "L" || currentType === "S"} />
        <LabelValueContainer />
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
