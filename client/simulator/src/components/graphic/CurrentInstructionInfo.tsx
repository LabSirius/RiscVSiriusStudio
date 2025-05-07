import { useEffect, useState } from "react";
import { useCurrentInst } from "@/context/graphic/CurrentInstContext";
import { useSimulator } from "@/context/shared/SimulatorContext";

const CurrentInstructionInfo = () => {
  const { operation, newPc } = useSimulator();
  const { currentInst } = useCurrentInst();
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
          className={`absolute flex gap-4 items-center top-[-5.8rem] left-0 pr-[1.2rem] ${animationClass}`}>
          <div className="bg-[#66939E] px-[1.2rem] py-[.7rem] rounded-[.6rem]">
            <h2 className="text-white text-center text-[1.8rem]">{currentInst.asm}</h2>
          </div>

          <div className="bg-[#66939E] px-[1.2rem] py-[.7rem] rounded-[.6rem]">
            <h2 className="text-white text-center text-[1.8rem]">{currentInst.type}</h2>
          </div>
        </div>
      )}
    </>
  );
};

export default CurrentInstructionInfo;
