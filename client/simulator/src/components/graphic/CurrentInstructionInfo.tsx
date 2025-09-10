import { useEffect, useState } from "react";
import { useCurrentInst } from "@/context/graphic/CurrentInstContext";
import { useSimulator } from "@/context/shared/SimulatorContext";

const CurrentInstructionInfo = () => {
  const { operation, newPc } = useSimulator();
  const { currentMonocycletInst } = useCurrentInst();
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
    <>
      {operation !== "uploadMemory" && (
        <div
          className={`absolute flex flex-col gap-4 ${currentMonocycletInst?.pseudoasm ? "top-[-11.5rem]" : "top-[-6.8rem]"} left-[18.5rem] pr-[1.2rem] ${animationClass}`}>
            {currentMonocycletInst?.pseudoasm && (
            <div className="bg-[#66939E] px-[1.2rem] py-[.7rem] rounded-[.6rem]">
              <h2 className="text-white text-start text-[1.8rem]">{currentMonocycletInst?.pseudoasm}</h2>
            </div>
          )}
          <div className="flex gap-4 ">
            <div className="bg-[#66939E] px-[1.2rem] py-[.7rem] rounded-[.6rem]">
              <h2 className="text-white text-center text-[1.8rem]">{currentMonocycletInst?.asm}</h2>
            </div>

            <div className="bg-[#66939E] px-[1.2rem] py-[.7rem] rounded-[.6rem]">
              <h2 className="text-white text-center text-[1.8rem]">{currentMonocycletInst?.type}</h2>
            </div>
          </div>
          
        </div>
      )}
    </>
  );
};

export default CurrentInstructionInfo;
