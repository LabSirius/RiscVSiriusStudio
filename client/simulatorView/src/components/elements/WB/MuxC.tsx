import MuxContainer from "../MUXContainer";
import { Handle, Position } from '@xyflow/react';

function MuxC() {
  return (
    <div className='relative w-full h-full'>
      <div className="relative w-full h-full">
        <MuxContainer />
      </div>
      <Handle  
        type="target"
        position={Position.Left}
        className='input'
        style={{ top: '1.8rem' }} 
      />

     <Handle  
        type="target"
        position={Position.Left}
        id='dataMemory'
        className='input'
        style={{ top: '4.7rem' }} 
      />

      <Handle  
        type="target"
        position={Position.Left}
        id='alu'
        className='input'
        style={{ top: '7.5rem' }} 
      />

      <Handle  
        type="target"
        position={Position.Bottom}
        className='input'
        style={{ top: '7rem' }} 
      />


      <Handle  type="source"
        position={Position.Right}
        className='output'
        style={{right:'.8rem'}} />
    </div>
  );
}

export default MuxC;
