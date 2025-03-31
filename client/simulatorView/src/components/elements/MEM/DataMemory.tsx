//import { Handle, Position } from '@xyflow/react';
import ContainerSVG from '../ContainerSVG';
import {Triangle} from 'lucide-react';

export default function DataMemory() {
  return (
    <div className='w-full'>

       <div className='relative w-full h-full'>
       <h2 className="titleInElement top-[15%] left-[50%]  -translate-x-[50%] -translate-y-[15%] ">Data Memory</h2>
        <ContainerSVG height={17}  />
        <Triangle size={24} className='absolute left-[50%]  transform -translate-x-[50%] text-[#404040] bottom-0 z-2' />
       </div>


    
    </div>
    
  );
}
