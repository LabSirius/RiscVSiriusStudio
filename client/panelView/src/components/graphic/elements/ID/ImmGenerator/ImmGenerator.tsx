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
      <HoverCardContent className="bg-black w-80">
      <div className="space-y-1  max-h-[20rem] overflow-auto hide-scrollbar">
            <h4 className="text-sm font-semibold">IMM DEC</h4>
            <h4 className="text-sm font-semibold">IMM DEC</h4>

            <h4 className="text-sm font-semibold">IMM DEC</h4>
            <h4 className="text-sm font-semibold">IMM DEC</h4>
            <h4 className="text-sm font-semibold">IMM DEC</h4>
            <h4 className="text-sm font-semibold">IMM DEC</h4>
            <h4 className="text-sm font-semibold">IMM DEC</h4>
            <h4 className="text-sm font-semibold">IMM DEC</h4>
            <h4 className="text-sm font-semibold">IMM DEC</h4>
            <h4 className="text-sm font-semibold">IMM DEC</h4>
            <h4 className="text-sm font-semibold">IMM DEC</h4>
            <h4 className="text-sm font-semibold">IMM DEC</h4>
            <h4 className="text-sm font-semibold">IMM DEC</h4>
            <h4 className="text-sm font-semibold">IMM DEC</h4>
            <h4 className="text-sm font-semibold">IMM DEC</h4>
            <h4 className="text-sm font-semibold">IMM DEC</h4>
            <h4 className="text-sm font-semibold">IMM DEC</h4>
            <h4 className="text-sm font-semibold">IMM DEC</h4>
          

           
           
          </div>
    </HoverCardContent>
    </HoverCard>
    
  );
}
