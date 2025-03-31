import { Handle, Position } from '@xyflow/react';
import ContainerSVG from '../ContainerSVG';
import {Triangle} from 'lucide-react';

export default function DataMemory() {
  return (
    <div className='w-full'>

       <div className='relative w-full h-full'>
       <h2 className="titleInElement top-[15%] left-[50%]  -translate-x-[50%] -translate-y-[15%] ">Data Memory</h2>
        <ContainerSVG height={18}  />
        <Triangle size={24} className='absolute left-[50%]  transform -translate-x-[50%] text-[#404040] bottom-0 z-2' />
       </div>

       <Handle  type="target"
              id="dmWr"
              position={Position.Top}
              className='input'
              style={{left:'4.5rem'}} />
        
        <Handle  type="target"
              id="dmCtrl"
              position={Position.Top}
              className='input'
              style={{left:'11.38rem'}} />

       <Handle  type="target"
              id="alu"
              position={Position.Left}
              className='input'
              style={{top:'7.75rem'}} />
              

        <Handle  type="target"
        id="rs2"
        position={Position.Left}
        className='input'
        style={{top:'12.75rem'}} />

        <Handle  type="source"
        position={Position.Right}
        className='output'
        style={{top:'12.75rem'}} />
            
    
    </div>
    
  );
}
