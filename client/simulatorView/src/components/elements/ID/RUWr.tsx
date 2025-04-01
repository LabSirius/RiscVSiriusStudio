import { Handle, Position } from '@xyflow/react';
import { useOverlay } from '@/context/OverlayContext';

export default function RUWr() {
  const { overlayDecodeActive} = useOverlay();
  return (
    <div className={`w-full`}>

       <div className='relative w-full h-full'>
       <h2 className={`titleInElement top-[-.9rem]  right-[1rem] ${overlayDecodeActive && 'overlay-scale'}`}>RUWr</h2>
       </div>
        
        <div  className={`${overlayDecodeActive && 'overlay-moveY'}`} >
        <Handle  type="source"
        position={Position.Right}
        className={`output-tunnel`}  />

        </div>
      
    </div>
    
  );
}
