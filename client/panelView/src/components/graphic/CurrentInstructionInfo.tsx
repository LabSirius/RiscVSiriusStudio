import { useEffect, useState } from "react";
import { useCurrentInst } from "@/context/graphic/CurrentInstContext";
import { usePC } from "@/context/shared/PCContext";
import { useOperation } from "@/context/panel/OperationContext";

const CurrentInstructionInfo = () => {
  const { currentInst } = useCurrentInst();
  const { newPc } = usePC();
  const [animationClass, setAnimationClass] = useState("");
  const { operation } = useOperation();

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
          className={`absolute flex gap-4 items-center top-[-3.7rem] right-[1rem] pr-[1.2rem] ${animationClass}`}>
          <div className="bg-[#66939E] px-[.8rem] py-[.3rem] rounded-[.3rem]">
            <h2 className="text-white text-center text-[.9rem]">{currentInst.asm}</h2>
          </div>
          <div className="bg-[#66939E] px-[.8rem] py-[.4rem] rounded-[.3rem]">
            <h2 className="text-white text-center text-[.8rem]">
              {currentInst.encoding.hexEncoding}
            </h2>
          </div>
          <div className="bg-[#66939E] px-[.7rem] py-[.3rem] rounded-[.3rem]">
            <h2 className="text-white text-center text-[.9rem]">{currentInst.type}</h2>
          </div>
        </div>
      )}
    </>
  );
};

export default CurrentInstructionInfo;
