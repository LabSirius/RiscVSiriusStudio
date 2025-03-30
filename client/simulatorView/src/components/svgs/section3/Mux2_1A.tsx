import Mux2_1 from "./MUX_2_1";
import { Handle, Position } from '@xyflow/react';

function Mux2_1A() {
  return (
    <div className='relative w-full h-full'>
      <div className="relative w-full h-full ">
          <Mux2_1 />
      </div>
      <Handle  type="target"
              id="registersUnitA"
              position={Position.Left}
              style={{ top: '6.8rem', background: '#555', width: 10, height: 10 }} />
    </div>
  );
}

export default Mux2_1A;
