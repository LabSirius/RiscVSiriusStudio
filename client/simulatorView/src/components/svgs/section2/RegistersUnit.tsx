import { Handle, Position } from '@xyflow/react';
import ContainerSVG from '../ContainerSVG';
import {Triangle} from 'lucide-react';

export default function RegistersUnit() {
  return (
    <div className='w-full'>

       <div className='relative w-full h-full'>
       <h2 className=" titleInElement top-[50%] left-[50%]  -translate-x-[50%] -translate-y-[50%] ">Registers Unit</h2>
        <ContainerSVG height={18.9}  />
        <Triangle size={24} className='absolute left-[50%]  transform -translate-x-[50%] text-[#404040] bottom-0 z-2' />
       </div>

       <Handle  type="target"
        id="[19:15]"
        position={Position.Left}
        className='input'
        style={{ top: '2.2rem' }} />

       <Handle  type="target"
        id="[24:20]"
        position={Position.Left}
        className='input'
        style={{ top: '6.2rem' }} />
        

       <Handle  type="target"
        id="[17:7]"
        position={Position.Left}
        className='input'
        style={{ top: '12.2rem'}} />

      <Handle  type="source"
        position={Position.Right}
        id="muxA"
        className='output'
        style={{ top: '3.9rem'}} />

      <Handle  type="source"
        position={Position.Right}
        className='output'
        id="muxB"
        style={{ top: '12.2rem'}} />

    
    </div>
    
  );
}
