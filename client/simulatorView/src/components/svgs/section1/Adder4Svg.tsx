import { Handle, Position } from '@xyflow/react';
import LargeContainerSVG from '../containers/LargeContainerSVG';
import { Sigma } from 'lucide-react'; 

export default function Adder4Svg() {
  return (
    <div className='relative w-full h-full'>
      <div>
        <Sigma size={46} className="text-[#4A4A4A] absolute top-[50%] left-[45%] transform -translate-x-[45%] -translate-y-[50%] z-2" />
        <LargeContainerSVG />
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
