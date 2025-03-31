import { Handle, Position } from '@xyflow/react';

export default function ALUOp() {
  return (
    <div className='w-full'>

       <div className='relative w-full h-full'>
       <h2 className="titleInElement top-[.3rem]  left-[50%] -translate-x-[50%] ">ALUOp</h2>
       </div>

      <Handle  type="source"
        position={Position.Top}
        className='output'
        style={{ top: '4.4rem' }} />

      
    </div>
    
  );
}
