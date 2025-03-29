import { Handle, Position } from '@xyflow/react';
import ContainerSVG from '../ContainerSVG';
import { Sigma } from 'lucide-react'; 

export default function Adder4Svg() {
  return (
    <div className='relative w-full h-full'>
      <div>
        <Sigma size={46} className="text-[#555555] absolute top-[50%] left-[50%] transform -translate-x-[50%] -translate-y-[50%] z-2" />
        <ContainerSVG height={7.5}/>
      </div>


      <Handle
        type="target"
        position={Position.Left}
        id="fourTarget"
        style={{ top: '2rem', background: '#555', width: 10, height: 10 }}
      />
      
      <Handle
        type="target"
        position={Position.Left}
        id="adder4Target"
        style={{ top: '5rem', background: '#555', width: 10, height: 10 }}
      />


    </div>
  );
}
