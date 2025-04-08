import ContainerSVG from '../../ContainerSVG';
import { Handle , Position} from '@xyflow/react';
import LabelSlash from '@/components/graphic/LabelSlash';
import LabelValueContainer from './LabelValueContainer';

export default function InstructionMemory() {

  return (
    <div className='w-full h-full'>
      <div className='relative w-full h-full'>
       <h2 className="titleInElement top-[15%] left-[80%]  -translate-x-[80%] -translate-y-[15%]">Instruction Memory</h2>

        <div className='relative'>
          <ContainerSVG height={13}  active={true} />


          <div className='absolute bottom-[5.1rem] right-[-2.5rem]'>
              <LabelSlash number={32} />
          </div>
        </div>
        
         <LabelValueContainer />
       
       </div>
      <Handle  type="target"
        position={Position.Left}
        className='input'
        style={{ top: '8.3rem'}} />
         
      <Handle  type="source"
        position={Position.Right}
        className='output'
        style={{ top: '10.03rem'}} />
      </div>
  );
}
