import Mux2_1 from "./MUX_2_1";
import { Handle, Position } from '@xyflow/react';

function Mux2_1B() {
  return (
    <div className='relative w-full h-full'>
      <div className="relative w-full h-full">
          <Mux2_1 />
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
        style={{ top: '6.9rem', background: '#555', width: 10, height: 10 }} 
      />
    </div>
  );
}

export default Mux2_1B;
