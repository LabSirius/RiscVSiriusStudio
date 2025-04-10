import { useIR } from '@/context/graphic/IRContext';
import ContainerSVG from '../../ContainerSVG';
import { Handle, Position } from '@xyflow/react';
import LabelValueContainer from './LabelValueContainer';

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/graphic/ui/hover-card"

export default function ImmGenerator() {
  const { currentType} = useIR()
  
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
    <div className='w-full '>

       <div className='relative w-full h-full'>
       <h2 className=" titleInElement top-[30%] left-[15%]  -translate-x-[15%] -translate-y-[30%] ">Imm Generator</h2>
       <ContainerSVG height={9.6} active={currentType !== "R"} />
       <LabelValueContainer />
       </div>

        <Handle  type="target"
               id="[31:7]"
               position={Position.Left}
               className='input'
               style={{ top: '3.5rem' }} />

        <Handle  type="target"
               id="immSrc"
               position={Position.Left}
               className='input'
               style={{ top: '8rem' }} />

        <Handle type="source"
              position={Position.Right} className='output' />

    </div>
    </HoverCardTrigger>
     {!(currentType === 'R') && <HoverCardContent className="bg-black w-[45rem]">
      <div className="space-y-1  w-full max-h-[30rem] overflow-auto hide-scrollbar">
            <img src='immTypeIDecodeSvg.svg' alt="immDecode" height={100} width={100} className='w-full h-full rounded-md' />           
          </div>
    </HoverCardContent> }
    </HoverCard>
    
  );
}
