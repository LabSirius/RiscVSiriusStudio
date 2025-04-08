import { Handle, Position } from '@xyflow/react';
import ContainerSVG from '../../ContainerSVG';
import { Triangle } from 'lucide-react';
import LabelSlashContainer from './LabelSlashContainer';

interface HandlerConfig {
  id: string;
  top: string;  // This is the top value for styling
}

export default function RegistersUnit() {

  const inputHandlers: HandlerConfig[] = [
    { id: '[19:15]', top: '3.15rem' },
    { id: '[24:20]', top: '8.15rem' },
    { id: '[11:7]', top: '13.15rem' },
    { id: 'dataWr', top: '19.17rem' },
    { id: 'ruWr', top: '24.62rem' },
  ];

  const outputHandlers: HandlerConfig[] = [
    { id: 'muxA', top: '4.9rem' },
    { id: 'muxB', top: '13.12rem' },
  ];

  return (
    <div className='w-full'>

      <div className='relative w-full h-full'>
        <h2 className=" titleInElement top-[90%] left-[82%]  -translate-x-[82%] -translate-y-[90%] ">Registers Unit</h2>
        <div className='relative'>
          <ContainerSVG height={28}  active={true} />

          <LabelSlashContainer />
        </div>
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
