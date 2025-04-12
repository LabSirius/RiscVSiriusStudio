import { Handle, Position } from '@xyflow/react';
import ContainerSVG from '../../ContainerSVG';
import LabelValueContainer from './LabelValueContainer';
import { useOperation } from '@/context/panel/OperationContext';

export default function BranchUnit() {
  const { operation} = useOperation();
  return (
    <div className='w-full'>

       <div className='relative w-full h-full'>
       <h2 className=" titleInElement  top-[50%] left-[73.5%]  -translate-x-[73.5%] -translate-y-[50%] ">Branch Unit</h2>
        <ContainerSVG height={10.2} active={true}  />
        {(operation !== "uploadMemory") && <LabelValueContainer />}

       </div>

       <Handle  type="target"
        id="RS2"
        position={Position.Left}
        className='input'
        style={{ top: '2.5rem' }} />

       <Handle  type="target"
        id="RS1"
        position={Position.Left}
        className='input'
        style={{ top: '7rem' }} />    

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
