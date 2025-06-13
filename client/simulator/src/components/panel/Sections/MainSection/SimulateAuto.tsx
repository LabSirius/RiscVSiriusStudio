import { TimerReset, TimerOff } from "lucide-react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/graphic/ui/hover-card";
import { useSimulator } from "@/context/shared/SimulatorContext";
import { sendMessage } from "@/components/Message/sendMessage";
import { useEffect, useState } from "react";
import { useDialog } from "@/context/panel/DialogContext";
import { Slider } from "@/components/panel/ui/slider";
import { cn } from "@/lib/utils";

const SimulateAuto = () => {
  const { typeSimulator, operation, simulateAuto, setSimulateAuto } = useSimulator();
  const [end, setEnd] = useState(false);
  const [speed, setSpeed] = useState(1); // 0: slow, 1: medium, 2: fast
  const { dialog } = useDialog();

  const speedToDelay = [4000, 2000, 1000];
  const intervalDelay = speedToDelay[speed];

  useEffect(() => {
    if (!simulateAuto) return;
    if (dialog && dialog.stop) {
      setSimulateAuto(false);
      setEnd(true);
      return;
    }

    const interval = setInterval(() => {
      sendMessage({ event: "step" });
    }, intervalDelay);

    return () => clearInterval(interval);
  }, [simulateAuto, dialog, setSimulateAuto, intervalDelay]);

  useEffect(() => {
    if (operation === "uploadMemory") {
      setEnd(false);
    }
  }, [operation]);

  return (
    <>
      {operation !== "" && !end && (
        <HoverCard>
          <HoverCardTrigger
            className={`absolute ${
              typeSimulator === "graphic" ? "top-[3.35rem]" : "top-[2.5rem]"
            }  right-[1.1rem]`}>
            {simulateAuto ? (
              <TimerOff
                size={16}
                className="cursor-pointer"
                onClick={() => setSimulateAuto((prev) => !prev)}
              />
            ) : (
              <TimerReset
                size={16}
                className="cursor-pointer"
                onClick={() => setSimulateAuto((prev) => !prev)}
              />
            )}
          </HoverCardTrigger>

          <HoverCardContent className="w-40">
            <div className="text-xs mb-1 font-semibold">Speed</div>
            <Slider
              defaultValue={[1]}
              min={0}
              max={2}
              step={1}
              value={[speed]}
              onValueChange={([v]) => setSpeed(v)}
              className={cn("w-full")}
            />
            <div className="text-[10px] mt-1 text-muted-foreground text-center">
              {["Slow", "Medium", "Fast"][speed]}
            </div>
          </HoverCardContent>
        </HoverCard>
      )}
    </>
  );
};

export default SimulateAuto;
