import { Handle, Position } from '@xyflow/react';
import { useOverlay } from '@/context/OverlayContext';


export default function ALUBSrc() {
  const { overlayExecuteActive} = useOverlay();

  return (
    <div className='w-full'>

       <div className='relative w-full h-full'>
       <h2 className={` titleInElement top-[.3rem]   ${overlayExecuteActive && 'overlay-scale'}`}>ALUBSrc</h2>
       </div>

       <div  className={`${overlayExecuteActive && 'overlay-moving'}`} >
      <Handle  type="source"
               position={Position.Top}
               className='output-tunnel'
               style={{ top:'-.4rem' } } />
      </div>

        
    </div>
    
  );
}
