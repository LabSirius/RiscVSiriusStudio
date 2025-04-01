import { Handle, Position } from '@xyflow/react';

export default function BrOp() {
  return (
    <div className='w-full'>

       <div className='relative w-full h-full'>
       <h2 className="titleInElement top-[.3rem] left-[50%] -translate-x-[50%] ">BrOp</h2>
       </div>

      <Handle  type="source"
               position={Position.Top}
               className='output-tunnel'
               style={{ top: '4.4rem' }} />
    </div>
    
  );
}
