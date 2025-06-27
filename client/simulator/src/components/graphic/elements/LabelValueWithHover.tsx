import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/graphic/ui/hover-card";
import LabelValue from "@/components/graphic/LabelValue";

interface Props {
  label: string;
  value: string;
  decimal: string;
  binary: string;
  hex: string;
  positionClassName: string;
  input?: boolean;
  operation?: string;
  showMsbNote?: boolean;
  showZeroExtend?: boolean;
  dmCtrl?: boolean;
}

const LabelValueWithHover = ({
  label,
  value,
  decimal,
  binary,
  hex,
  positionClassName,
  input = true,
}: Props) => {
  return (
    <div className={`absolute ${positionClassName}`}>
      <HoverCard>
        <HoverCardTrigger asChild>
          <div>
            <LabelValue label={label} value={value} input={input} />
          </div>
        </HoverCardTrigger>
        <HoverCardContent className="!rounded-sm !px-2 !py-1 flex gap-[1rem] bg-[#404040] w-full !b-[.2rem]">
          <p className="!text-[.6rem]">d'{decimal}</p>

          <p className="!text-[.6rem]">b'{binary}</p>
          <p className="!text-[.6rem]">h'{hex}</p>
        </HoverCardContent>
      </HoverCard>
    </div>
  );
};

export default LabelValueWithHover;
