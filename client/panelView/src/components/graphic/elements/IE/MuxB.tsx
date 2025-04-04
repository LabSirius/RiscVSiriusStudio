import MuxContainer from "../MUXContainer";
import { Handle, Position } from '@xyflow/react';

function MuxB() {
  return (
    <div className='relative w-full h-full'>
      <div className="relative w-full h-full">
          <MuxContainer />
      </div>
      <Handle  
        type="target"
        id="registersUnitB"
        position={Position.Left}
        className='input'
        style={{ top: '2.8rem' }} 
      />

      <Handle  
        type="target"
        id="immGenerator"
        position={Position.Left}
        className='input'
        style={{ top: '6.8rem' }} 
      />

      <Handle  
        type="target"
        id="aluBSrc"
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

export default MuxB;
