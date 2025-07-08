import { RotateCcw } from "lucide-react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/graphic/ui/hover-card";
import { useSimulator } from "@/context/shared/SimulatorContext";
import { sendMessage } from "@/components/Message/sendMessage";
import { useEffect, useState } from "react";
import { useDialog } from "@/context/panel/DialogContext";

const ResetSimulation = () => {
  const { typeSimulator, operation } = useSimulator();
  const { dialog } = useDialog();

  const [end, setEnd] = useState(false);

  useEffect(() => {
    if (dialog && dialog.stop) {
      setEnd(true);
      return;
    }
  }, [dialog]);

  useEffect(() => {
    if (operation === "uploadMemory") {
      setEnd(false);
    }
  }, [operation]);

  const handleReset = () => {
    sendMessage({ event: "reset" });
    setEnd(true);
  };

  return (
    <>
      {operation === "step" && (
        <HoverCard>
          <HoverCardTrigger
            onClick={handleReset}
            className={`absolute ${
              typeSimulator === "graphic"
                ? end
                  ? "top-[3.35rem]"
                  : "top-[5.33rem]" 
                : end
                ? "top-[2.5rem]"
                : "top-[4.5rem]"
            } right-[1.1rem]`}>
            <RotateCcw size={16} className="cursor-pointer" />
          </HoverCardTrigger>

          <HoverCardContent className="w-40 text-xs mb-1 font-semibold">
            Reset simulation
          </HoverCardContent>
        </HoverCard>
      )}
    </>
  );
};

export default ResetSimulation;
