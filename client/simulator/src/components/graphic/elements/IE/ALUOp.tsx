import { Handle, Position } from '@xyflow/react';
import { useOverlay } from '@/context/graphic/OverlayContext';
import { useSimulator } from '@/context/shared/SimulatorContext';
import { useCurrentInst } from '@/context/graphic/CurrentInstContext';


export default function ALUOp() {

  const {operation, isEbreak, typeSimulator} = useSimulator();
    const { overlayExecuteActive} = useOverlay();
    const {pipelineValuesStages} = useCurrentInst(  )



    const isActive = operation === "uploadMemory" || ( typeSimulator === "pipeline" ? pipelineValuesStages.EX.instruction.pc !== -1 : true)

  return (
    <div className='w-full'>

       <div className='relative w-full h-full'>
       <h2 className={` titleInElement top-[1rem] left-[50%] -translate-x-[50%]  ${overlayExecuteActive && 'overlay-scale'}. ${(isEbreak || !isActive) && "!text-[#D3D3D3]"}`}>ALUOp</h2>
       </div>


       <div  className={`${overlayExecuteActive && 'overlay-moveX'}`} >
      <Handle  type="source"
        position={Position.Top}
        className='output-tunnel' 
        style={{top: "1.4rem"}}
        />
        
        
      </div>

      
    </div>
    
  );
}
