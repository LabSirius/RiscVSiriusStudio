import { Handle, Position } from '@xyflow/react';
import { useOverlay } from '@/context/OverlayContext';

export default function ALUOp() {
    const { overlayExecuteActive} = useOverlay();
  return (
    <div className='w-full'>

       <div className='relative w-full h-full'>
       <h2 className={` titleInElement top-[-.2rem] left-[50%] -translate-x-[50%]  ${overlayExecuteActive && 'overlay-scale'}`}>ALUOp</h2>
       </div>


       <div  className={`${overlayExecuteActive && 'overlay-moveX'}`} >
      <Handle  type="source"
        position={Position.Top}
        className='output-tunnel' />
      </div>

      
    </div>
    
  );
}
