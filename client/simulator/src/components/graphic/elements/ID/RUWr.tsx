import { Handle, Position } from '@xyflow/react';
import { useOverlay } from '@/context/graphic/OverlayContext';
import { useSimulator } from '@/context/shared/SimulatorContext';


export default function RUWr() {
  const { typeSimulator} = useSimulator()
  const { overlayDecodeActive} = useOverlay();
  return (
    <div className={`w-full`}>

       <div className='relative w-full h-full'>
       <h2 className={`titleInElement right-[1rem] top-[40%] -translate-y-[40%] ${overlayDecodeActive && 'overlay-scale'}`}>RUWr{typeSimulator === 'pipeline' && ''}</h2>
       </div>
        
        <div  className={`${overlayDecodeActive && 'overlay-moveY'}`} >
        <Handle  type="source"
        position={Position.Right}
        className={`output-tunnel`}  />

        </div>
      
    </div>
    
  );
}
