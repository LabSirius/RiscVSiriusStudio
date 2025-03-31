import { Handle, Position } from '@xyflow/react';

export default function Four() {
  return (
    <div className=''>

       <div className='relative w-full h-full'>
       <h2 className="titleInElement right-0 top-[50%] -translate-y-[50%]">4</h2>
       </div>
        
       <Handle  type="source"
        position={Position.Right}
        className='output'
        style={{ transform: 'translateX(-50%)'}} />
    </div>
    
  );
}
