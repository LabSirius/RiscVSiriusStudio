import { Handle, Position } from '@xyflow/react';
import { useOverlay } from '@/context/OverlayContext';

export default function ALUOp() {
    const { overlayExecuteActive} = useOverlay();
  return (
    <div className='w-full'>

       <div className='relative w-full h-full'>
       <h2 className={` titleInElement top-[-.2rem]   ${overlayExecuteActive && 'overlay-scale'}`}>ALUOp</h2>
       </div>


       <div  className={`${overlayExecuteActive && 'overlay-moving'}`} >
      <Handle  type="source"
        position={Position.Top}
        className='output-tunnel' />
      </div>

      
    </div>
    
  );
}
