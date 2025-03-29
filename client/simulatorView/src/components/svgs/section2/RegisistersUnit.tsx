import { Handle, Position } from '@xyflow/react';
import LargeContainerSVG from '../containers/LargeContainerSVG';
import {Triangle} from 'lucide-react';

export default function RegistersUnitSvg() {
  return (
    <div className=''>

       <div className='relative w-full h-full'>
       <h2 className="text-2xl text-[#4A4A4A] absolute top-[50%] left-[45%] transform -translate-x-[45%] -translate-y-[50%] z-2">RU</h2>
        <LargeContainerSVG  />
        <Triangle size={20} className='absolute left-[45%]  transform -translate-x-[45%] text-[#404040] bottom-[1.3rem] z-2 ' />
       </div>
        

        <Handle  type="source"
        position={Position.Right}
        style={{ transform: 'translateX(-50%)' }}/>
    </div>
    
  );
}
