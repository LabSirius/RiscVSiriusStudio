import { Handle, Position } from '@xyflow/react';
import ContainerSVG from '../ContainerSVG';
import { Triangle } from 'lucide-react';
import { useIR } from '@/context/graphic/IRContext';
import LabelSlash from '@/components/graphic/LabelSlash';

interface HandlerConfig {
  id: string;
  top: string;  // This is the top value for styling
}

export default function RegistersUnit() {
  const { currentType } = useIR();

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

          <div className='absolute top-[1rem] left-[-6.85rem] flex flex-col gap-[4rem]'>
            <div className='flex flex-col gap-[2.9rem]'>
              <LabelSlash label='rs1' number={5}  inactive={(currentType === 'LUI')}/>
              <LabelSlash label='rs2' number={5} inactive={!(currentType === 'R' || currentType === 'B')} />
              <LabelSlash label='rd' number={5} inactive={(currentType === 'B')}/>
            </div>
            <div className='ml-[.8rem]'>
              <LabelSlash number={32} inactive={(currentType === 'S' || currentType === 'B')} />
            </div>
            
          </div>
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
