import { Handle, Position } from '@xyflow/react';
import LargeContainerSVG from '../containers/LargeContainerSVG';

export default function Adder4SVG() {
  return (
    <div className='relative w-full h-full'>
      <div>
        <h2 className="text-2xl text-[#4A4A4A] absolute top-[50%] left-[45%] transform -translate-x-[45%] -translate-y-[50%] z-2">4</h2>
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
        id="pcTarget"
        style={{ top: '5rem', background: '#555', width: 10, height: 10 }}
      />


    </div>
  );
}
