import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/graphic/ui/hover-card";

import LabelValue from "@/components/graphic/LabelValue";

const LabelValueWithHover = ({
  label,
  value,
  decimal,
  binary,
  hex,
  positionClassName,
  input = true,
}: {
  label: string;
  value: string;
  decimal: string;
  binary: string;
  hex: string;
  positionClassName: string;
  input?: boolean;
}) => {

  return (
    <div className={`absolute ${positionClassName}`}>
      <HoverCard>
        <HoverCardTrigger asChild>
          <div>
            <LabelValue label={label} value={value} input={input} />
          </div>
        </HoverCardTrigger>
        <HoverCardContent className="!text-[.65rem] flex flex-col gap-2 bg-[#1B1B1B] ">
          <div>
            <p className="text-xs font-semibold text-gray-200">decimal:</p>
            <p>d'{decimal}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-200">binary:</p>
            <p className="">b'{binary}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-200">hexadecimal:</p>
            <p>h'{hex}</p>
          </div>
        </HoverCardContent>
      </HoverCard>
    </div>
  )

}
  


export default LabelValueWithHover;
