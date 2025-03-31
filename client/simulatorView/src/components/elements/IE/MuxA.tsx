import MuxContainer from "../MUXContainer";
import { Handle, Position } from '@xyflow/react';

function MuxA() {
  return (
    <div className='relative w-full h-full'>
      <div className="relative w-full h-full ">
          <MuxContainer />
      </div>

      <Handle  type="target"
              id="pc"
              position={Position.Left}
              className='input'
              style={{ top: '2.8rem' }} />
  
      <Handle  type="target"
              id="registersUnitA"
              position={Position.Left}
              className='input'
              style={{ top: '6.8rem' }} />

      <Handle  type="target"
              id="aluASrc"
              position={Position.Top}
              className='input'
              style={{ top: '1.5rem' }} />

      <Handle  type="source"
            position={Position.Right}
            className='output'
            style={{right:'.8rem' }} />
    </div>
  );
}

export default MuxA;
