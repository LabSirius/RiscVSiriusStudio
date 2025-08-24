import { Handle, Position } from '@xyflow/react';
import { useOverlay } from '@/context/graphic/OverlayContext';


export default function BrOp() {
    const { overlayExecuteActive} = useOverlay();
  
  return (
    <div className='w-full'>

       <div className='relative w-full h-full'>
       <h2 className={` titleInElement top-[.2rem] left-[20%] -translate-y-[25%] ${overlayExecuteActive && 'overlay-scale'}`}>BrOp</h2>
       </div>

       <div  className={`${overlayExecuteActive && 'overlay-moveX'}`} >
      <Handle  type="source"
               position={Position.Top}
               className='output-tunnel'
               style={{ top:'.1rem' } } />
       </div>
    </div>
    
  );
}
