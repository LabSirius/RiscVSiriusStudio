import { Handle, Position } from '@xyflow/react';
import { useIR } from '@/context/graphic/IRContext';
import ContainerSVG from '../../ContainerSVG';

import LabelSlash from '@/components/graphic/LabelSlash';
import Tunels from './outputTunnels/Tunels';

interface InputHandlerConfig {
  id: string;
  top: string;
}

export default function ControlUnit() {
  // Define input handlers (all are targets on the left side)
  const { currentType} = useIR();

  const inputHandlers: InputHandlerConfig[] = [
    { id: '[6:0]', top: '2.7rem' },
    { id: '[14:12]', top: '7.9rem' },
    { id: '[31:25]', top: '13.2rem' },
  ];

  return (
    <div className="relative w-full">

      <h2 className="titleInElement absolute top-[50%] left-[80%] -translate-x-[80%] -translate-y-[50%]">
        Control Unit
      </h2>
      <div className='relative'>
        <ContainerSVG height={16}  active={true} />
        <div className='absolute top-[.5rem] left-[-9.2rem] flex flex-col gap-[3rem]'>
          <LabelSlash label='opcode' number={7} />
          <LabelSlash label='funct3' number={3} inactive={currentType === 'LUI'} />
          <LabelSlash label='funct7' number={7} inactive={!(currentType === 'R')} />
        </div>
        <Tunels />
      </div>

      {/* Render input handlers programmatically */}
      {inputHandlers.map((handler) => (
        <Handle
          key={handler.id}
          type="target"
          id={handler.id}
          position={Position.Left}
          className="input"
          style={{ top: handler.top }}
        />
      ))}
    </div>
  );
}
