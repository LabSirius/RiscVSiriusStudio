//  This pivot connects the pc with the MUXA

import { useIR } from '@/context/graphic/IRContext';
import { Handle, Position } from '@xyflow/react';
import { Brackets } from 'lucide-react';

export default function PivotJump9() {
  const { currentType } = useIR()
  return (
    <div className='w-full'>

       <div className={`relative w-full h-full ${(currentType === 'R' || currentType === 'I' || currentType === 'L'  || currentType === 'S'  )&& 'opacity-20'}`}>
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
