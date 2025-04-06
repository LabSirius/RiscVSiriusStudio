import { Handle, Position } from '@xyflow/react';
import ContainerSVG from '../ContainerSVG';
import { Triangle } from 'lucide-react';

interface HandlerConfig {
  id: string;
  top: string;  // This is the top value for styling
}

export default function RegistersUnit() {
  const inputHandlers: HandlerConfig[] = [
    { id: '[19:15]', top: '2.2rem' },
    { id: '[24:20]', top: '7.2rem' },
    { id: '[11:7]', top: '12.2rem' },
    { id: 'dataWr', top: '17.8rem' },
    { id: 'ruWr', top: '21.8rem' },
  ];

  const outputHandlers: HandlerConfig[] = [
    { id: 'muxA', top: '3.95rem' },
    { id: 'muxB', top: '12.2rem' },
  ];

  return (
    <div className='w-full'>

      <div className='relative w-full h-full'>
        <h2 className=" titleInElement top-[33%] left-[50%]  -translate-x-[50%] -translate-y-[33%] ">Registers Unit</h2>
        <ContainerSVG height={25}  active={true} />
        <Triangle size={24} className='absolute left-[50%]  transform -translate-x-[50%] text-[#404040] bottom-0 z-2' />
      </div>

      {inputHandlers.map((handler) => (
        <Handle
          key={handler.id}
          type='target'
          id={handler.id}
          position={Position.Left}
          className='input'
          style={{ top: handler.top }}  // Using the top value here
        />
      ))}

      {outputHandlers.map((handler) => (
        <Handle
          key={handler.id}
          type='source'
          id={handler.id}
          position={Position.Right}
          className='output'
          style={{ top: handler.top }}
        />
      ))}
    </div>
  );
}
