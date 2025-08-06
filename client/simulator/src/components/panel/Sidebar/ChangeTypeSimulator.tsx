import { useSimulator } from "@/context/shared/SimulatorContext";
import { Button } from "@/components/ui/button";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { RefreshCcw } from "lucide-react";

const ChangeTypeSimulator = () => {
  const { typeSimulator, setTypeSimulator } = useSimulator();
  const nextType = typeSimulator === "monocycle" ? "pipeline" : "monocycle";

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Button variant="outline" size="icon" onClick={() => setTypeSimulator(nextType)}>
          <RefreshCcw />
        </Button>
      </HoverCardTrigger>
      <HoverCardContent
        className="text-xs max-w-max mr-[12rem] mt-[-3rem]"
        sideOffset={5}
        avoidCollisions={false}
        side="bottom">
        Change to <strong>{nextType}</strong>
      </HoverCardContent>
    </HoverCard>
  );
};

export default ChangeTypeSimulator;
