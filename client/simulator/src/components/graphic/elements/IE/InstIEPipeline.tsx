import { useCurrentInst } from "@/context/graphic/CurrentInstContext";
import { useSimulator } from "@/context/shared/SimulatorContext";

const InstIEPipeline = () => {
  const { typeSimulator, operation} = useSimulator();
  const { pipelineValuesStages } = useCurrentInst();

  if (typeSimulator === "monocycle" || operation === "uploadMemory") return;

  return (
    <div className=" flex items-center gap-5 ml-1 h-full bg-[#66939E] px-[1.2rem] py-[.7rem] rounded-[.6rem] text-white max-w-max">
      <p className="text-[1.8rem]">{pipelineValuesStages.EX.instruction.asm}</p>
       <p className="text-[1.6rem]">PC: <span className="text-[1.8rem]">{pipelineValuesStages.EX.instruction.inst ?? "--"}</span></p>
    </div>
  );
};

export default InstIEPipeline;
