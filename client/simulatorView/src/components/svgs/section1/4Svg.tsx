import { Handle, Position } from '@xyflow/react';

export default function _4Svg() {
  return (
    <div className=''>

       <div className='relative w-full h-full'>
       <h2 className="titleInElement top-[50%] left-[45%] -translate-x-[45%] -translate-y-[50%] ">4</h2>
       </div>
        
       <Handle  type="source"
        position={Position.Right}
        style={{ transform: 'translateX(-50%)' }} />
    </div>
    
  );
}
