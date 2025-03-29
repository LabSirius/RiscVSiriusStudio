import { Handle, Position } from '@xyflow/react';
import ContainerSVG from '../ContainerSVG';
import {Triangle} from 'lucide-react';

export default function RegistersUnitSvg() {
  return (
    <div className='w-full'>

       <div className='relative w-full h-full'>
       <h2 className=" titleInElement top-[50%] left-[50%]  -translate-x-[50%] -translate-y-[50%] ">Registers Unit</h2>
        <ContainerSVG height={18.9}  />
        <Triangle size={20} className='absolute left-[50%]  transform -translate-x-[50%] text-[#404040] bottom-0 z-2' />
       </div>
        

       <Handle  type="target"
        id="instructionMemoryTarget"
        position={Position.Left}
        style={{ top: '12.2rem', background: '#555', width: 10, height: 10 }} />
    </div>
    
  );
}
