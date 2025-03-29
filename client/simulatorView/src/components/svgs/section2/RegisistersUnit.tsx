import { Handle, Position } from '@xyflow/react';
import LargeContainerSVG from '../containers/LargeContainerSVG';
import {Triangle} from 'lucide-react';

export default function RegistersUnitSvg() {
  return (
    <div className=''>

       <div className='relative w-full h-full'>
       <h2 className=" titleInElement top-[50%] left-[45%]  -translate-x-[45%] -translate-y-[50%] ">Registers Unit</h2>
        <LargeContainerSVG  />
        <Triangle size={20} className='absolute left-[45%]  transform -translate-x-[45%] text-[#404040] bottom-[1.4rem] z-2 ' />
       </div>
        

       <Handle  type="target"
        id="instructionMemoryTarget"
        position={Position.Left}
        style={{ top: '12.2rem', background: '#555', width: 10, height: 10 }} />
    </div>
    
  );
}
