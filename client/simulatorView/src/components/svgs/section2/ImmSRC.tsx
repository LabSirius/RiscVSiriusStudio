import { Handle, Position } from '@xyflow/react';

export default function ImmSrc() {
  return (
    <div className='w-full'>

       <div className='relative w-full h-full'>
       <h2 className="titleInElement top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%] ">IMMSrc</h2>
       </div>
        
       <Handle  type="source"
        position={Position.Right}
        style={{ transform: 'translateX(-50%)' }} />
    </div>
    
  );
}
