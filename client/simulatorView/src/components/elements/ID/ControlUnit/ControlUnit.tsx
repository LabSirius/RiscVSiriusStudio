import { Handle, Position } from '@xyflow/react';
import ContainerSVG from '../../ContainerSVG';
import DecodeTunnel from './outputTunnels/DecodeTunnel';
import ExecuteTunnel from './outputTunnels/ExecuteTunnel';
import MemoryTunnel from './outputTunnels/MemoryTunnel';
import WBTunnel from './outputTunnels/WBTunnel';



export default function ControlUnit() {
  return (
    <div className="w-full relative">
      
        <h2 className="titleInElement absolute top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%]">
          Control Unit
        </h2>


        <div className='absolute inset-0 z-10 left-[10.6rem] top-[1.3rem] flex flex-col gap-[0.9rem]'>
          <DecodeTunnel />
          <ExecuteTunnel />
          <MemoryTunnel />
          <WBTunnel />
        </div>
      
   

      <ContainerSVG height={16} />

      <Handle
        type="target"
        id="[6:0]"
        position={Position.Left}
        className="input"
        style={{ top: '2.7rem' }}
      />
      <Handle
        type="target"
        id="[14:12]"
        position={Position.Left}
        className="input"
        style={{ top: '7.9rem' }}
      />
      <Handle
        type="target"
        id="[35:25]"
        position={Position.Left}
        className="input"
        style={{ top: '13.2rem' }}
      />
    </div>
  );
}

