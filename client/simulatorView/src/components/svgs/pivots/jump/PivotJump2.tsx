//  This pivot connects the RU with the branch and the RU with the MUXA, and is used so that it does not collide with the PC line that goes to the MUXA.

import { Handle, Position } from '@xyflow/react';
import { Brackets } from 'lucide-react';

export default function PivotJump2() {
  return (
    <div className='w-full'>

       <div className='relative w-full h-full'>
            <Brackets size={38} strokeWidth={1} color='#000' />
       </div>

       <Handle  type="target"
        position={Position.Left}
        style={{ top: '1.6rem', left:'.4rem' }} />
        
       <Handle  type="source"
        position={Position.Right}
        style={{ top: '1.6rem', right: '.8rem', }} />
    </div>
    
  );
}
