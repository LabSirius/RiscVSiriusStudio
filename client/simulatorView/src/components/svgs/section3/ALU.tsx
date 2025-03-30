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
        style={{ top: '3.1rem', background: '#555', width: 10, height: 10 }} />

       <Handle  type="target"
        id="muxB"
        position={Position.Left}
        style={{ top: '15.3rem', background: '#555', width: 10, height: 10 }} />  

      <Handle  
        type="target"
        id="aluOp"
        position={Position.Bottom}
        style={{ background: '#555', width: 10, height: 10 }} 
      />  
    </div>
    
  );
}
