import { Handle, Position } from '@xyflow/react';
import ContainerSVG from '../ContainerSVG';

export default function ALU() {
  return (
    <div className='w-full'>

       <div className='relative w-full h-full'>
       <h2 className=" titleInElement top-[70%] left-[50%]  -translate-x-[50%] -translate-y-[70%] ">ALU</h2>
        <ContainerSVG height={19.9}  />
       </div>

       <Handle  type="target"
        id="muxA"
        position={Position.Left}
        className='input'
        style={{ top: '5rem'}} />

       <Handle  type="target"
        id="muxB"
        position={Position.Left}
        className='input'
        style={{ top: '15.8rem'}} />  

      <Handle  
        type="target"
        id="aluOp"
        position={Position.Bottom}
        className='input'
      />  
    </div>
    
  );
}
