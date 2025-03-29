import ContainerSVG from '../containers/ContainerSvg';
import { Handle , Position} from '@xyflow/react';

export default function InstructionMemorySvg() {
  return (
    <div style={{ position: 'relative' }}>
      <div className='relative w-full h-full'>
       <h2 className="titleInElement top-[15%] left-[45%]  -translate-x-[45%] -translate-y-[15%]">Instruction Memory</h2>
        <ContainerSVG />
       </div>
      <Handle  type="target"
        position={Position.Left}
        style={{ transform: 'translateX(-50%)' }} />
      <Handle  type="source"
        position={Position.Right}
        style={{ top: '10rem', background: '#555', width: 10, height: 10 }} />
      </div>
  );
}
