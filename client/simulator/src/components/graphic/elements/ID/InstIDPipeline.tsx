import { useCurrentInst } from "@/context/graphic/CurrentInstContext";
import { useSimulator } from "@/context/shared/SimulatorContext";
import { Info, X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useState } from "react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const InstIDPipeline = () => {
  const { typeSimulator, operation } = useSimulator();
  const { pipelineValuesStages } = useCurrentInst();
  const [isOpen, setIsOpen] = useState(false);

  if (typeSimulator === "monocycle" || operation === "uploadMemory") {
    return null;
  }

  const hazardMessage = pipelineValuesStages.ID.HazardMessage
    ? (pipelineValuesStages.ID.HazardMessage as string).split(" | ").join("\n\n")
    : "";

  return (
    <div className="relative flex items-center gap-5 ml-1 h-full bg-[#66939E] px-[1.2rem] py-[.7rem] rounded-[.6rem] text-white max-w-max">
      <p className="text-[1.8rem]">{pipelineValuesStages.ID.instruction.asm}</p>
      {pipelineValuesStages.ID.instruction.pc !== -1 && (
        <p className="text-[1.6rem]">
          PC: <span className="text-[1.8rem]">{pipelineValuesStages.ID.instruction.inst}</span>
        </p>
      )}

      {pipelineValuesStages.ID.HazardMessage && (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <button
              aria-label="Show hazard details"
              className="absolute top-1/2 -translate-y-1/2 right-[-3.4rem] cursor-pointer"
            >
              {isOpen ? (
                <X size={46} className="text-black" />
              ) : (
                <Info size={46} className="text-red-400" />
              )}
            </button>
          </PopoverTrigger>

          <PopoverContent className="w-auto max-w-md" side="right" align="start">
            <div className="prose-sm prose dark:prose-invert max-w-none !text-[.7rem]">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {hazardMessage}
              </ReactMarkdown>
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
};

export default InstIDPipeline;
