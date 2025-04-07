import { Handle, Position } from '@xyflow/react';
import { useIR } from '@/context/graphic/IRContext';
import ContainerSVG from '../../ContainerSVG';
import DecodeTunnel from './outputTunnels/DecodeTunnel';
import ExecuteTunnel from './outputTunnels/ExecuteTunnel';
import MemoryTunnel from './outputTunnels/MemoryTunnel';
import WBTunnel from './outputTunnels/WBTunnel';
import LabelSlash from '@/components/graphic/LabelSlash';

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

      <h2 className="titleInElement absolute top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%]">
        Control Unit
      </h2>


      <div className='absolute inset-0 z-10 left-[10.6rem] top-[1.3rem] flex flex-col gap-[0.9rem]'>
        <DecodeTunnel />
        <ExecuteTunnel />
        <MemoryTunnel />
        <WBTunnel />
      </div>

      <div className='relative'>
        <ContainerSVG height={16}  active={true} />
        <div className='absolute top-[1.1rem] left-[-8rem] flex flex-col gap-[3.7rem]'>
          <LabelSlash label='opcode' number={7} />
          <LabelSlash label='funct3' number={3} inactive={currentType === 'LUI'} />
          <LabelSlash label='funct7' number={7} inactive={!(currentType === 'R')} />
        </div>
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
