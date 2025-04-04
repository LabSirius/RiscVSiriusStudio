import { Handle, Position } from '@xyflow/react';

import { useOverlay } from '@/context/graphic/OverlayContext';



export default function RUDataWrSrc() {
  const { overlayWBActive} = useOverlay();
  return (
    <div className='w-full'>

       <div className='relative w-full h-full'>
       <h2 className={` titleInElement top-[.6rem] left-[50%] -translate-[50%]   ${overlayWBActive && 'overlay-scale'}`}>RUDataWrSrc</h2>
       </div>

       <div  className={`${overlayWBActive && 'overlay-moveX'}`} >
      <Handle  type="source"
               position={Position.Top}
               className='output-tunnel'
               style={{ top:'-.4rem' } } />
         </div> 
    </div>
    
  );
}
