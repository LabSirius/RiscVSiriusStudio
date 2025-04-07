import ContainerSVG from '../ContainerSVG';
import { Handle , Position} from '@xyflow/react';
import LabelSlash from '@/components/graphic/LabelSlash';

export default function InstructionMemory() {

  return (
    <div className='w-full h-full'>
      <div className='relative w-full h-full'>
       <h2 className="titleInElement top-[15%] left-[80%]  -translate-x-[80%] -translate-y-[15%]">Instruction Memory</h2>

        <div className='relative'>
          <ContainerSVG height={12.6}  active={true} />


          <div className='absolute bottom-[4.1rem] right-[-2.5rem]'>
              <LabelSlash number={32} />
          </div>
        </div>
        
        <div className='subtitleInElement absolute top-[42%] left-[.8rem]'>
          <h3 className=''>Address: </h3>
        </div>
        
        <div className='subtitleInElement absolute top-[63%] right-[.8rem]'>
          <h3 >Instruction</h3>
        </div>
       
       </div>
      <Handle  type="target"
        position={Position.Left}
        className='input' />
      <Handle  type="source"
        position={Position.Right}
        className='output'
        style={{ top: '10.03rem'}} />
      </div>
  );
}
