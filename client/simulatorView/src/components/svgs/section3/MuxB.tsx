import MuxContainer from "./MUXContainer";
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
        style={{ top: '2.8rem', background: '#555', width: 10, height: 10 }} 
      />

      <Handle  
        type="target"
        id="immGenerator"
        position={Position.Left}
        style={{ top: '6.8rem', background: '#555', width: 10, height: 10 }} 
      />

      <Handle  
        type="target"
        id="aluBSrc"
        position={Position.Bottom}
        style={{ top: '7rem', background: '#555', width: 10, height: 10 }} 
      />


      <Handle  type="source"
        position={Position.Right}
        style={{ transform: 'translateX(-50%)', right:'.3rem',  background: '#555', width: 10, height: 10 }} />
    </div>
  );
}

export default MuxB;
