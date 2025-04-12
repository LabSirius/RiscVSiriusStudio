import { Handle, Position } from '@xyflow/react';
import { useOverlay } from '@/context/graphic/OverlayContext';



export default function DMWR() {
  const { overlayMemoryActive} = useOverlay();

  return (
    <div className='w-full'>

       <div className='relative w-full h-full'>
       <h2 className={` titleInElement top-[-1.9rem]  left-[50%] -translate-x-[50%]  ${overlayMemoryActive && 'overlay-scale'}`}>DMWR</h2>
       </div>

       <div  className={`${overlayMemoryActive && 'overlay-moveX-t'}`} >
      <Handle  type="source"
               position={Position.Bottom}
               className='output-tunnel'
               style={{ top: '1rem'}} />
      </div>

        
    </div>
    
  );
}
