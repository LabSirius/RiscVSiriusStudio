import { Handle, Position } from '@xyflow/react';
import { Brackets } from 'lucide-react';

export default function PivotJump1() {
  return (
    <div className=''>

       <div className='relative w-full h-full'>
            <Brackets size={36} strokeWidth={1} />
       </div>

       <Handle  type="target"

              position={Position.Left}
              style={{ top: '2.8rem', background: '#555', width: 10, height: 10 }} />
        
       <Handle  type="source"
        position={Position.Right}
        style={{ transform: 'translateX(-50%)',  background: '#555', width: 10, height: 10 }} />
    </div>
    
  );
}
