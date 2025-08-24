import { Handle, Position } from '@xyflow/react';
import { useOverlay } from '@/context/graphic/OverlayContext';
import { useSimulator } from '@/context/shared/SimulatorContext';


export default function ALUBSrc() {
  const { overlayExecuteActive} = useOverlay();
  const { typeSimulator} = useSimulator()


  return (
    <div className='w-full'>

       <div className='relative w-full h-full'>
       <h2 className={` titleInElement top-[-.5rem]  ${overlayExecuteActive && 'overlay-scale'}`}>ALUBSrc{typeSimulator === 'pipeline' && '_ex'}</h2>
       </div>

       <div  className={`${overlayExecuteActive && 'overlay-moveX'}`} >
      <Handle  type="source"
               position={Position.Top}
               className='output-tunnel'
               style={{ top:'-.2rem' } } />
      </div>

        
    </div>
    
  );
}
