import { Handle, Position } from '@xyflow/react';

export default function DMCtrl() {
  return (
    <div className='w-full'>

       <div className='relative w-full h-full'>
       <h2 className="titleInElement top-[-1.7rem] left-[50%] -translate-x-[50%] ">DMCtrl</h2>
       </div>

      <Handle  type="source"
               position={Position.Bottom}
               className='output-tunnel'
               style={{ top: '4.5rem'}} />

        
    </div>
    
  );
}