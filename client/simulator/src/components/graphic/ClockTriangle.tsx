import { useSimulator } from "@/context/shared/SimulatorContext";
import { Triangle } from "lucide-react";
import { useEffect, useState } from "react";

const ClockTriangle = () => {
  const { newPc } = useSimulator();
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
  
      setAnimate(true);
      const timeout = setTimeout(() => setAnimate(false), 400); 
      return () => clearTimeout(timeout);
    
  }, [newPc]);

  return (
    <Triangle
      size={24}
      className={`absolute left-[50%] transform -translate-x-[50%] text-[#404040] bottom-0 z-2 ${animate ? "pc-change-anim" : ""}`}
    />
  );
};

export default ClockTriangle;
