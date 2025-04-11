//  This pivot connects the pc with the MUXA

import { useCurrentInst } from '@/context/graphic/CurrentInstContext';
import { Handle, Position } from '@xyflow/react';
import { Brackets } from 'lucide-react';

export default function PivotJump6() {
  const { currentInst } = useCurrentInst();
  return (
    <div className='w-full'>

      <div className={`relative w-full h-full ${( currentInst.type === 'L' || currentInst.type === 'JALR' || currentInst.type === 'B'  )&& 'opacity-20'}`}>
            <Brackets size={38} strokeWidth={1} color='#000' />
       </div>

       <Handle  type="target"
        position={Position.Left}
        style={{ top: '1.6rem', left:'.4rem' }} />
        
       <Handle  type="source"
        position={Position.Right}
        style={{ top: '1.6rem', right: '.9rem', }} />
    </div>
    
  );
}
