import { useCurrentInst } from "@/context/graphic/CurrentInstContext";
import ContainerSVG from "../../ContainerSVG";
import { Handle, Position } from "@xyflow/react";
import LabelValueContainer from "./LabelValueContainer";
import { PanelTopClose, X } from "lucide-react";
import { useState } from "react";

import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import ImmDecode from "./immDecode/ImmDecode";
import { useSimulator } from "@/context/shared/SimulatorContext";

export default function ImmGenerator() {
  const { operation, isEbreak } = useSimulator();
  const { currentType, pipelineValuesStages } = useCurrentInst();

  const [showImmDecode, setShowImmDecode] = useState(false);
  const [isCardOpen, setIsCardOpen] = useState(false);

  const handleOpenChange = (open : boolean) => {
    if (!open && showImmDecode) {
      return; 
    }
    setIsCardOpen(open);
  };

  const isTypeR = currentType === "R" || pipelineValuesStages.ID.instruction.type === "R"

  const isFeatureEnabled = !isTypeR && operation !== "uploadMemory" && !isEbreak;

  return (
    <HoverCard open={isCardOpen} onOpenChange={handleOpenChange} openDelay={0}>
      <HoverCardTrigger asChild>
        <div className="w-full">
          <div className="relative w-full h-full">
            <h2 className={`!z-0 titleInElement top-[25%] left-[30%] -translate-x-[15%] -translate-y-[25%] ${!isFeatureEnabled && '!text-[#D3D3D3]'}`}>
              Imm Generator
            </h2>
            <ContainerSVG height={9.6} active={isFeatureEnabled} />
            {isFeatureEnabled && <LabelValueContainer />}
          </div>
          <Handle type="target" id="[31:7]" position={Position.Left} className="input" style={{ top: "2.7rem" }} />
          <Handle type="target" id="immSrc" position={Position.Left} className="input" style={{ top: "7rem" }} />
          <Handle type="source" position={Position.Right} className="output" />
        </div>
      </HoverCardTrigger>
      
      {isFeatureEnabled && (
        <HoverCardContent className={`${showImmDecode ? 'p-0 w-[45rem]' : 'px-2 py-1 w-min flex justify-end bg-[#404040]'}`} side="top">
         
          {!showImmDecode && (
            <PanelTopClose
              size={20}
              className="cursor-pointer trasnform hover:scale-[0.9] transition-transform ease-in-out"
              onClick={() => setShowImmDecode(true)}
            />
          )}
          
          {showImmDecode && (
            <div className="relative">
              <X 
                size={22} 
                className="absolute top-2 right-2 cursor-pointer text-white p-1 hover:scale-[0.95] transition-transform  bg-red-400 rounded-lg z-[1000000]"
                onClick={() => {
                  setShowImmDecode(false);
                  setIsCardOpen(false);
                }}
              />
              <ImmDecode /> 
            </div>
          )}
        
        </HoverCardContent>
      )} 
    </HoverCard>
  );
}