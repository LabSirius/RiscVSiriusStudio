import { Handle, Position } from '@xyflow/react';

export default function ImmSrc() {
  return (
    <div className='w-full'>

       <div className='relative w-full h-full'>
       <h2 className="titleInElement right-[1.7rem] top-[50%] -translate-y-[50%]  ">IMMSrc</h2>
       </div>
        
       <Handle  type="source"
        position={Position.Right}
        className='output' style={{top:'1.2rem'}} />
    </div>
    
  );
}
