import { Handle, Position } from '@xyflow/react';
import ContainerSVG from '../ContainerSVG';

export default function ControlUnitSvg() {
  return (
    <div className='w-full'>

       <div className='relative w-full h-full'>
       <h2 className=" titleInElement top-[50%] left-[50%]  -translate-x-[50%] -translate-y-[50%] ">Control Unit</h2>
        <ContainerSVG height={14}  />
       </div>

       <Handle  type="target"
        id="[6:0]"
        position={Position.Left}
        style={{ top: '2.2rem', background: '#555', width: 10, height: 10 }} />

        <Handle  type="target"
        id="[14:12]"
        position={Position.Left}
        style={{ top: '6.7rem', background: '#555', width: 10, height: 10 }} />

        <Handle  type="target"
        id="[35:25]"
        position={Position.Left}
        style={{ top: '11.2rem', background: '#555', width: 10, height: 10 }} />

    </div>
    
  );
}
