// This pivot brings the pc and the destination is pivot 2 (which ends up taking the pc to the muxA)

import { Handle, Position } from '@xyflow/react';
import { Brackets } from 'lucide-react';

export default function PivotJump10() {
  return (
    <div className='w-full'>

       <div className='relative w-full h-full'>
            <Brackets size={38} strokeWidth={1} color='#000' />
       </div>

       <Handle  type="target"

        position={Position.Right}
        style={{ top: '1.6rem', right:'.9rem' }} />
        
       <Handle  type="source"
        position={Position.Left}
        style={{ top: '1.6rem', left: '.4rem', }} />
    </div>
    
  );
}
