import { Handle, Position } from '@xyflow/react';

export default function RUWr() {
  return (
    <div className='w-full'>

       <div className='relative w-full h-full'>
       <h2 className="titleInElement top-[-.9rem]  right-[1rem]  ">RUWr</h2>
       </div>
        
       <Handle  type="source"
        position={Position.Right}
        className='output-tunnel'  />
    </div>
    
  );
}
