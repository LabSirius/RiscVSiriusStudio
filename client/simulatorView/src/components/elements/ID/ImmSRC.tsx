import { Handle, Position } from '@xyflow/react';
import { useOverlay } from '@/context/OverlayContext';

export default function ImmSrc() {
  const { overlayDecodeActive} = useOverlay();

  return (
    <div className='w-full'>

       <div className='relative w-full h-full'>
       <h2 className={`titleInElement right-[.7rem] top-[50%] -translate-y-[50%]  ${overlayDecodeActive && 'overlay-scale'}`}>IMMSrc</h2>
       </div>
        
       <div  className={`${overlayDecodeActive && 'overlay-rotate'}`} >
        <Handle  type="source"
          position={Position.Right}
          className='output-tunnel' style={{top:'1.2rem'}} />
        </div>
    </div>
    
  );
}
