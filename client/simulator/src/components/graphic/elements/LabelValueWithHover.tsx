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
        <HoverCardContent className="!px-2 !py-1 flex gap-[1rem] bg-[#404040] w-full !b-[.2rem]">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[.5rem] font-semibold text-gray-200">decimal</p>
              <p className="!text-[.6rem]">d'{decimal}</p>
            </div>

          </div>

          <div>
            <p className="text-[.5rem] font-semibold text-gray-200">binary</p>
            <p className="!text-[.6rem]">b'{binary}</p>
          </div>
          <div>
            <p className="text-[.5rem] font-semibold text-gray-200">hexadecimal</p>
            <p className="!text-[.6rem]">h'{hex}</p>
          </div>
        </HoverCardContent>
      </HoverCard>
    </div>
  );
};

export default LabelValueWithHover;
