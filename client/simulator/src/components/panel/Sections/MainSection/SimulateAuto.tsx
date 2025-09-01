import { TimerReset, TimerOff } from "lucide-react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { useSimulator } from "@/context/shared/SimulatorContext";
import { sendMessage } from "@/components/Message/sendMessage";
import { useEffect, useState } from "react";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

const SimulateAuto = () => {
  const { simulateAuto, setSimulateAuto } = useSimulator();
  const [speed, setSpeed] = useState(1); // 0: slow, 1: medium, 2: fast

  const speedToDelay = [4000, 2000, 1000];
  const intervalDelay = speedToDelay[speed];

  useEffect(() => {
    if (!simulateAuto) return;

    const interval = setInterval(() => {
      sendMessage({ event: "step" });
    }, intervalDelay);

    return () => clearInterval(interval);
  }, [simulateAuto, intervalDelay]);

  return (
    <>
      <HoverCard>
        <HoverCardTrigger id="simulate-auto">
          {simulateAuto ? (
            <TimerOff
              size={18}
              className="cursor-pointer"
              onClick={() => setSimulateAuto((prev) => !prev)}
            />
          ) : (
            <TimerReset
              size={18}
              className="cursor-pointer "
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
    </>
  );
};

export default SimulateAuto;
