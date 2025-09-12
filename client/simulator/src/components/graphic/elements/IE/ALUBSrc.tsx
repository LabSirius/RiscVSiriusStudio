import { Handle, Position } from '@xyflow/react';
import { useOverlay } from '@/context/graphic/OverlayContext';
import { useSimulator } from '@/context/shared/SimulatorContext';
import { useCurrentInst } from '@/context/graphic/CurrentInstContext';


export default function ALUBSrc() {
   const { typeSimulator, operation, isEbreak} = useSimulator();
  
    const {pipelineValuesStages} = useCurrentInst()
    
    const { overlayExecuteActive } = useOverlay();
  
    const isActive = operation === "uploadMemory" || ( typeSimulator === "pipeline" ? pipelineValuesStages.EX.instruction.pc !== -1 : true)


  return (
    <div className='w-full'>

       <div className='relative w-full h-full'>
       <h2 className={` titleInElement top-[-.5rem]  ${overlayExecuteActive && 'overlay-scale'}. ${(isEbreak || !isActive) && "!text-[#D3D3D3]"}`}>ALUBSrc{typeSimulator === 'pipeline' && '_ex'}</h2>
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
