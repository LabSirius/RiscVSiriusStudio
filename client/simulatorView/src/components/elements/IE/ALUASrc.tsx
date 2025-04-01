import { Handle, Position } from '@xyflow/react';
import { useOverlay } from '@/context/OverlayContext';


export default function ALUASrc() {
    const { overlayExecuteActive} = useOverlay();
  
  return (
    <div className='w-full'>

       <div className='relative w-full h-full'>
       <h2 className={` titleInElement top-[-.8rem]   ${overlayExecuteActive && 'overlay-scale'}`}>ALUASrc</h2>
       </div>

       <div  className={`${overlayExecuteActive && 'overlay-rotate'}`} >
      <Handle  type="source"
               position={Position.Bottom}
               className='output-tunnel'
               style={{ top: '2rem'}} />
      </div>

        
    </div>
    
  );
}
