import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/graphic/ui/hover-card";
import LabelValue from "@/components/graphic/LabelValue";

const aluOperations: Record<string, string> = {
  "0000": "A + B",
  "1000": "A - B",
  "0100": "A ⊕ B",
  "0110": "A | B",
  "0111": "A & B",
  "0001": "A << B",
  "0101": "A >> B",
  "1101": "A >> B", // with MSB extension
  "0010": "A < B",
};

interface Props {
  label: string;
  value: string;
  decimal: string;
  binary: string;
  hex: string;
  positionClassName: string;
  input?: boolean;
  aluOp?: string;
}

const LabelValueWithHover = ({
  label,
  value,
  decimal,
  binary,
  hex,
  positionClassName,
  input = true,
  aluOp,
}: Props) => {
  const operation = aluOp ? aluOperations[aluOp] : undefined;
  const showMsbNote = aluOp === "1101";

  return (
    <div className={`absolute ${positionClassName}`}>
      <HoverCard>
        <HoverCardTrigger asChild>
          <div>
            <LabelValue label={label} value={value} input={input} />
          </div>
        </HoverCardTrigger>
        <HoverCardContent className="!text-[.65rem] flex flex-col gap-2 bg-[#1B1B1B]">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-200">decimal:</p>
              <p>d'{decimal}</p>
            </div>

            {operation && (
              <div>
                <p className="text-xs font-semibold text-gray-200">operation:</p>
                <h2 className="!text-[.7rem]">{operation}</h2>
                {showMsbNote && (
                  <p className="text-[.6rem] text-gray-400">msb-extends</p>
                )}
              </div>
            )}
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
  );
};

export default LabelValueWithHover;
