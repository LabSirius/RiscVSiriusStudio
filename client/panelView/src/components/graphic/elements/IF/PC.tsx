import { Handle, Position } from '@xyflow/react';
import ContainerSVG from '../ContainerSVG';
import {Triangle} from 'lucide-react';

export default function PC() {
  return (
    <div className='w-full h-full'>

       <div className='relative w-full h-full'>
       <h2 className="titleInElement top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%]">PC</h2>
        <ContainerSVG  height={7.4} active={true} />
        <Triangle size={20} className='absolute left-[45%]  transform -translate-x-[45%] text-[#404040] bottom-0 z-2 ' />
       </div>

       <Handle type="target"
        position={Position.Left}
        className='input' />
        

        <Handle  type="source"
        position={Position.Right}
        className='output' />
    </div>
    
  );
}
