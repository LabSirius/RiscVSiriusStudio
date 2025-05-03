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
  operation,
  showMsbNote = false,
  showZeroExtend = false,
  dmCtrl = false,
}: Props) => {
  return (
    <div className={`absolute ${positionClassName}`}>
      <HoverCard>
        <HoverCardTrigger asChild>
          <div>
            <LabelValue label={label} value={value} input={input} />
          </div>
        </HoverCardTrigger>
        <HoverCardContent className="!text-[.65rem] flex flex-col gap-2 bg-[#404040]">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-200">decimal:</p>
              <p>d'{decimal}</p>
            </div>

            {operation && (
              <div>
                <p className="text-xs font-semibold text-gray-200">operation{dmCtrl && ' with'}:</p>
                <h2 className="!text-[.7rem]">{operation}</h2>
                {showMsbNote && (
                  <p className="text-[.6rem] text-gray-400">msb-extends</p>
                )}
                {showZeroExtend && (
                  <p className="text-[.6rem] text-gray-400">zero-extends</p>
                )}
              </div>
            )}
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-200">binary:</p>
            <p>b'{binary}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-200">hexadecimal:</p>
            <p>h'{hex}</p>
          </div>
        </HoverCardContent>
      </HoverCard>
    </div>
  );
};

export default LabelValueWithHover;
