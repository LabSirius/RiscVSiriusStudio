import { Handle, Position } from '@xyflow/react';
import ContainerSVG from '../ContainerSVG';

export default function BranchUnit() {
  return (
    <div className='w-full'>

       <div className='relative w-full h-full'>
       <h2 className=" titleInElement top-[50%] left-[50%]  -translate-x-[50%] -translate-y-[50%] ">Branch Unit</h2>
        <ContainerSVG height={7.2}  />
       </div>

       <Handle  type="target"
        id=""
        position={Position.Left}
        style={{ top: '2rem', background: '#555', width: 10, height: 10 }} />

       <Handle  type="target"
        id="RS1"
        position={Position.Left}
        style={{ top: '5rem', background: '#555', width: 10, height: 10 }} />    
    </div>
    
  );
}
