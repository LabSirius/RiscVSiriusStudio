import ContainerSVG from '../ContainerSVG';
import { Handle, Position } from '@xyflow/react';

export default function ImmGeneratorSvg() {
  return (
    <div className='w-full '>

       <div className='relative w-full h-full'>
       <h2 className=" titleInElement top-[50%] left-[50%]  -translate-x-[50%] -translate-y-[50%] ">Inmmediate Generator</h2>
        <ContainerSVG height={6}  />
       </div>

        <Handle  type="target"
               id="[31:7]"
               position={Position.Left}
               style={{ top: '2rem', background: '#555', width: 10, height: 10 }} />

        <Handle  type="target"
               id="immSrc"
               position={Position.Left}
               style={{ top: '4.4rem', background: '#555', width: 10, height: 10 }} />

        <Handle type="source"
              position={Position.Right}
              style={{   background: '#555', width: 10, height: 10 }} />

    </div>
    
  );
}
