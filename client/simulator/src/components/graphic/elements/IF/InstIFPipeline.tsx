import { useCurrentInst } from "@/context/graphic/CurrentInstContext";
import { useSimulator } from "@/context/shared/SimulatorContext";

const InstIFPipeline = () => {
  const { typeSimulator } = useSimulator();
  const { pipelineValuesStages } = useCurrentInst();

  if (typeSimulator === "monocycle") return;

  return (
    <div className=" flex items-center gap-5 ml-1 h-full bg-[#66939E] px-[1.2rem] py-[.7rem] rounded-[.6rem] text-white max-w-max">
      <p className="text-[1.8rem]">{pipelineValuesStages.IF.instruction.asm}</p>
       <p className="text-[1.6rem]">PC: <span className="text-[1.8rem]">{pipelineValuesStages.IF.instruction.inst ?? "--"}</span></p>
    </div>
  );
};

export default InstIFPipeline;
