import { Handle, Position } from '@xyflow/react';

export default function ImmSrc() {
  return (
    <div className='w-full'>

       <div className='relative w-full h-full'>
       <h2 className="titleInElement right-[1.7rem] top-[50%] -translate-y-[50%]  ">IMMSrc</h2>
       </div>
        
       <Handle  type="source"
        position={Position.Right}
        style={{ transform: 'translateX(-50%)',  background: '#555', width: 10, height: 10 }} />
    </div>
    
  );
}
