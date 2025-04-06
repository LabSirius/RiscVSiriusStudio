import { Handle, Position } from '@xyflow/react';
import { useIR } from '@/context/graphic/IRContext';
import ContainerSVG from '../ContainerSVG';

export default function BranchUnit() {
  const { currentType} = useIR();
  return (
    <div className='w-full'>

       <div className='relative w-full h-full'>
       <h2 className=" titleInElement top-[50%] left-[50%]  -translate-x-[50%] -translate-y-[50%] ">Branch Unit</h2>
        <ContainerSVG height={7.2} active={currentType === "B"}  />
       </div>

       <Handle  type="target"
        id="RS2"
        position={Position.Left}
        className='input'
        style={{ top: '2rem' }} />

       <Handle  type="target"
        id="RS1"
        position={Position.Left}
        className='input'
        style={{ top: '5rem' }} />    

       <Handle  type="target"
        id="brOp"
        position={Position.Bottom}
        className='input' />  

        <Handle  type="source"
        position={Position.Right}
        className='output' />  
    </div>
    
  );
}
