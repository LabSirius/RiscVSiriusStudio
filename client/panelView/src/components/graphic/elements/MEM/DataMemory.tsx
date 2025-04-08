import { useIR } from '@/context/graphic/IRContext';
import { Handle, Position } from '@xyflow/react';
import ContainerSVG from '../ContainerSVG';

interface HandlerConfig {
  id?: string;
  top?: string;
  left?: string;
}

export default function DataMemory() {
  const { currentType } = useIR();

  const inputHandlers: HandlerConfig[] = [
    { id: 'dmWr', left: '4.5rem' },
    { id: 'dmCtrl', left: '11.38rem' },
    { id: 'alu', top: '9rem' },
    { id: 'rs2', top: '14.75rem' },
  ];

  const outputHandlers: HandlerConfig[] = [
    { top: '14rem' },
  ];

  return (
    <div className='w-full'>

      <div className='relative w-full h-full'>
        <h2 className="titleInElement top-[15%] left-[50%] -translate-x-[50%] -translate-y-[15%]">
          Data Memory
        </h2>
        <ContainerSVG height={19.2} active={currentType === "L" || currentType === "S"} />
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
