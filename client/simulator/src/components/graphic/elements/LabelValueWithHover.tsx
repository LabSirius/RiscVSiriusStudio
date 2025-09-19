import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card";
import LabelValue from "@/components/graphic/LabelValue";
import { useTheme } from "@/components/ui/theme/theme-provider";

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
  const { theme } = useTheme();

  return (
    <div className={`absolute ${positionClassName}`}>
      <HoverCard>
        <HoverCardTrigger asChild>
          <div>
            <LabelValue label={label} value={value} input={input} />
          </div>
        </HoverCardTrigger>
        <HoverCardContent
          className={`!rounded-sm !px-2 !py-1 flex gap-[1rem] w-full !b-[.2rem]
            ${theme === "light" ? "bg-[#f5f5f5] text-black" : "bg-[#404040] text-white"}`}
        >
          <p className="!text-[.6rem]">d'{decimal}</p>
          <p className="!text-[.6rem]">b'{binary}</p>
          <p className="!text-[.6rem]">h'{hex}</p>
        </HoverCardContent>
      </HoverCard>
    </div>
  );
};

export default LabelValueWithHover;
