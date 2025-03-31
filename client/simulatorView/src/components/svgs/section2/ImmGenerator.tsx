import ContainerSVG from '../ContainerSVG';
import { Handle, Position } from '@xyflow/react';

export default function ImmGenerator() {
  return (
    <div className='w-full '>

       <div className='relative w-full h-full'>
       <h2 className=" titleInElement top-[50%] left-[50%]  -translate-x-[50%] -translate-y-[50%] ">Inmmediate Generator</h2>
        <ContainerSVG height={7.2}  />
       </div>

        <Handle  type="target"
               id="[31:7]"
               position={Position.Left}
               className='input'
               style={{ top: '2rem' }} />

        <Handle  type="target"
               id="immSrc"
               position={Position.Left}
               className='input'
               style={{ top: '5rem' }} />

        <Handle type="source"
              position={Position.Right} className='output' />

    </div>
    
  );
}
