import { Handle, Position } from '@xyflow/react';
import ContainerSVG from '../ContainerSVG';
import { Sigma } from 'lucide-react'; 

export default function Adder4() {
  return (
    <div className='relative w-full h-full'>
      <div>
        <Sigma size={46} className="text-[#555555] absolute top-[50%] left-[50%] transform -translate-x-[50%] -translate-y-[50%] z-2" />
        <ContainerSVG height={7.5}  active={true}/>
      </div>

      <Handle
        type="target"
        position={Position.Left}
        id="fourTarget"
         className='input'
        style={{ top: '2rem' }}
      />
      
      <Handle
        type="target"
        position={Position.Left}
        id="pivot"
        className='input'
        style={{ top: '5rem'}}
      />

      <Handle
        type="source"
        position={Position.Right}
        className='output'
        style={{ top: '2rem'}}
      />


    </div>
  );
}
