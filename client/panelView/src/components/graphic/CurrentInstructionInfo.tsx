import { useEffect, useState } from "react";
import { useIR } from "@/context/graphic/IRContext";
import { usePC } from "@/context/shared/PCCONTEXT";

const CurrentInstructionInfo = () => {
  const { ir } = useIR();
  const { newPc } = usePC();
  const [animationClass, setAnimationClass] = useState("");

  useEffect(() => {
    setAnimationClass("animate-exit");
    
    const timerEnter = setTimeout(() => {
      setAnimationClass("animate-enter");
    }, 300); 

    const timerReset = setTimeout(() => {
      setAnimationClass("");
    }, 600);

    return () => {
      clearTimeout(timerEnter);
      clearTimeout(timerReset);
    };
  }, [newPc]);

  return (
    <div className={`absolute flex gap-4 items-center top-[-3.7rem] right-[1rem] pr-[1.2rem] ${animationClass}`}>
      <div className="bg-[#66939E] px-[.8rem] py-[.3rem] rounded-[.3rem]">
        <h2 className="text-white text-center text-[.9rem]">{ir.instructions[newPc].asm}</h2>
      </div>
      <div className="bg-[#66939E] px-[.8rem] py-[.4rem] rounded-[.3rem]">
        <h2 className="text-white text-center text-[.8rem]">{ir.instructions[newPc].encoding.hexEncoding}</h2>
      </div>
      <div className="bg-[#66939E] px-[.7rem] py-[.3rem] rounded-[.3rem]">
        <h2 className="text-white text-center text-[.9rem]">{ir.instructions[newPc].type}</h2>
      </div>
    </div>
  );
};

export default CurrentInstructionInfo;
