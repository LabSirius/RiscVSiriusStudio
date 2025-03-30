<<<<<<< HEAD
// This pivot brings the pc and the destination is pivot 2 (which ends up taking the pc to the muxA)

=======
>>>>>>> 253534b (The logic of component names is changed before adding more pivots.)
import { Handle, Position } from '@xyflow/react';
import { Brackets } from 'lucide-react';

export default function PivotJump1() {
  return (
<<<<<<< HEAD
    <div className='w-full'>

       <div className='relative w-full h-full'>
            <Brackets size={38} strokeWidth={1} color='#000' />
=======
    <div className=''>

       <div className='relative w-full h-full'>
            <Brackets size={36} strokeWidth={1} />
>>>>>>> 253534b (The logic of component names is changed before adding more pivots.)
       </div>

       <Handle  type="target"

<<<<<<< HEAD
        position={Position.Left}
        style={{ top: '1.6rem', left:'.4rem' }} />
        
       <Handle  type="source"
        position={Position.Right}
        style={{ top: '1.6rem', right: '.8rem', }} />
=======
              position={Position.Left}
              style={{ top: '2.8rem', background: '#555', width: 10, height: 10 }} />
        
       <Handle  type="source"
        position={Position.Right}
        style={{ transform: 'translateX(-50%)',  background: '#555', width: 10, height: 10 }} />
>>>>>>> 253534b (The logic of component names is changed before adding more pivots.)
    </div>
    
  );
}
