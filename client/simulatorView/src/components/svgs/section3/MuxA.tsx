import MuxContainer from "./MUXContainer";
import { Handle, Position } from '@xyflow/react';

function MuxA() {
  return (
    <div className='relative w-full h-full'>
      <div className="relative w-full h-full ">
          <MuxContainer />
      </div>
  
      <Handle  type="target"
              id="registersUnitA"
              position={Position.Left}
              style={{ top: '6.8rem', background: '#555', width: 10, height: 10 }} />

      <Handle  type="target"
              id="aluASrc"
              position={Position.Top}
              style={{ top: '1.5rem', background: '#555', width: 10, height: 10 }} />
    </div>
  );
}

export default MuxA;
