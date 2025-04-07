import { usePC } from '@/context/shared/PCCONTEXT';
import { Handle, Position } from '@xyflow/react';
import ContainerSVG from '../ContainerSVG';
import {Triangle} from 'lucide-react';

export default function PC() {
  const { newPc} = usePC();

  return (
    <div className='w-full h-full'>

       <div className='relative w-full h-full'>
       <h2 className="titleInElement top-[15%] left-[50%] -translate-x-[50%] -translate-y-[15%]">PC</h2>
       <div className='relative w-full h-full'>
        <ContainerSVG  height={7.4} active={true} />
        <div className='valueInElement top-[42%] right-[.8rem]'>
          <h3 className=''>{newPc*4}</h3>
        </div>
        </div>
        <Triangle size={20} className='absolute left-[50%]  transform -translate-x-[50%] text-[#404040] bottom-0 z-2 ' />
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
