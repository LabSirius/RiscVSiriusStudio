import { Handle, Position } from '@xyflow/react';
import { useOverlay } from '@/context/OverlayContext';


export default function DMWR() {
  const { overlayMemoryActive} = useOverlay();

  return (
    <div className='w-full'>

       <div className='relative w-full h-full'>
       <h2 className={` titleInElement top-[-1.3rem]   ${overlayMemoryActive && 'overlay-scale'}`}>DMWR</h2>
       </div>

       <div  className={`${overlayMemoryActive && 'overlay-moving-t'}`} >
      <Handle  type="source"
               position={Position.Bottom}
               className='output-tunnel'
               style={{ top: '1rem'}} />
      </div>

        
    </div>
    
  );
}
