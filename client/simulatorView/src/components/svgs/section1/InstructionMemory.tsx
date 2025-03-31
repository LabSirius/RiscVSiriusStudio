import ContainerSVG from '../ContainerSVG';
import { Handle , Position} from '@xyflow/react';

export function InstructionMemory() {
  return (
    <div className='w-full h-full'>
      <div className='relative w-full h-full'>
       <h2 className="titleInElement top-[15%] left-[50%]  -translate-x-[50%] -translate-y-[15%]">Instruction Memory</h2>
        <ContainerSVG height={12.6} />
       </div>
      <Handle  type="target"
        position={Position.Left}
        className='input' />
      <Handle  type="source"
        position={Position.Right}
        style={{ top: '10rem', }} />
      </div>
  );
}

export function IMAddress() {
  return (
    <div>
      <div>
      <span>Address</span><br></br>
      <span>0x777777</span>
      </div>
      <Handle  type="target"
        position={Position.Left}
      />
      <Handle  type="source"
        position={Position.Right}
      />
    </div>
  );
}
