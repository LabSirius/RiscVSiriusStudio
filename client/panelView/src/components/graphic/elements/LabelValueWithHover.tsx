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
}) => (
  <div className={`absolute ${positionClassName}`}>
    <HoverCard>
      <HoverCardTrigger asChild>
        <div>
          <LabelValue label={label} value={value} input={input} />
        </div>
      </HoverCardTrigger>
      <HoverCardContent className="!text-[.65rem] font-mono flex flex-col gap-2">
        <div>
          <p className="text-xs font-semibold text-slate-300">decimal:</p>
          <hr className="my-[2px]" />
          <p>d'{decimal}</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-300">binary:</p>
          <hr className="my-[2px]" />
          <p className="break-all">b'{binary}</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-300">hex:</p>
          <hr className="my-[2px]" />
          <p>h'{hex}</p>
        </div>
      </HoverCardContent>
    </HoverCard>
  </div>
);

export default LabelValueWithHover;
