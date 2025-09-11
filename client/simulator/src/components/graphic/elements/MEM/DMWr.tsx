import { Handle, Position } from '@xyflow/react';
import { useOverlay } from '@/context/graphic/OverlayContext';
import { useCurrentInst } from '@/context/graphic/CurrentInstContext';
import { useSimulator } from '@/context/shared/SimulatorContext';



export default function DMWR() {
  const { overlayMemoryActive} = useOverlay();
  const { currentType, pipelineValuesStages} = useCurrentInst();
  const { isFirstStep, typeSimulator } = useSimulator();


  const isActive = typeSimulator === "pipeline" ?    pipelineValuesStages.MEM.instruction.type === "S" || (pipelineValuesStages.MEM.instruction.type === "I" && pipelineValuesStages.MEM.instruction.opcode === "0000011") : currentType === "L" || currentType === "S"


  return (
    <div className='w-full'>

       <div className='relative w-full h-full'>
       <h2 className={` titleInElement top-[-1.9rem]  left-[50%] -translate-x-[50%]  ${overlayMemoryActive && 'overlay-scale'} ${!(isActive || !isFirstStep) && '!text-[#D3D3D3]'  }`}>DMWR</h2>
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
