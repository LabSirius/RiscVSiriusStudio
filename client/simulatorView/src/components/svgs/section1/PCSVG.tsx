import { Handle, Position } from '@xyflow/react';
import LargeContainerSVG from '../containers/LargeContainerSVG';
import {Triangle} from 'lucide-react';

export default function PCSvg() {
  return (
    <div className=''>

       <div className='relative w-full h-full'>
       <h2 className="titleInElement top-[50%] left-[45%] -translate-x-[45%] -translate-y-[50%]">PC</h2>
        <LargeContainerSVG  />
        <Triangle size={20} className='absolute left-[45%]  transform -translate-x-[45%] text-[#404040] bottom-[.4rem] z-2 ' />
       </div>
        

        <Handle  type="source"
        position={Position.Right}
        style={{ transform: 'translateX(-50%)' }}/>
    </div>
    
  );
}
