import { useCurrentInst } from "@/context/graphic/CurrentInstContext";

const TypeJImmDecode = () => {
  const { currentMonocycletInst, pipelineValuesStages } = useCurrentInst();

  const instruction = currentMonocycletInst || pipelineValuesStages?.ID?.instruction;
  if (!instruction) return null;

  const encoding = instruction.encoding?.binEncoding;
  if (!encoding) return null;

  const topBlocks = [
    { left: "2.5rem", slice: [1, 4] },
    { left: "6.2rem", slice: [4, 8] },
    { left: "11.2rem", slice: [8, 11] },
    { left: "16.1rem", slice: [12, 16] },
    { left: "21.1rem", slice: [16, 20] },
  ];

  const bottomRepeatedBlocks = [
    { right: "39.54rem" },
    { right: "34.55rem" },
    { right: "29.65rem" },
  ];

  const bottomDataBlocks = [
    { right: "24.67rem", slice: [12, 16] },
    { right: "19.74rem", slice: [16, 20] },
    { right: "14.77rem", slice: [1, 4] },
    { right: "9.87rem", slice: [4, 8] },
    { right: "6.2rem", slice: [8, 11] },
  ];

  return (
    <div className="w-full z-100000 max-h-[30rem] text-[.75rem] text-black overflow-hidden font-mono relative">
      <img
        src="immTypeJDecode.svg"
        alt="immDecode"
        className="w-full h-full rounded-md"
      />

      {/* Bits individuales */}
      <p className="absolute top-[2.7rem] left-[1.26rem]">{encoding[0]}</p>
      <p className="absolute top-[2.7rem] left-[14.83rem]">{encoding[11]}</p>
      <p className="absolute bottom-[1.6rem] right-[18.53rem]">{encoding[11]}</p>
      <p className="absolute bottom-[1.6rem] right-[4.96rem]">0</p>

      {/* Top blocks */}
      {topBlocks.map((block, idx) => (
        <div
          key={`top-${idx}`}
          className="absolute flex gap-[.82rem]"
          style={{ top: "2.7rem", left: block.left }}
        >
          {Array.from(encoding).slice(...block.slice).map((item, index) => (
            <p key={index}>{item}</p>
          ))}
        </div>
      ))}

      {/* Bottom repeated blocks (copian el bit[0]) */}
      {bottomRepeatedBlocks.map((block, idx) => (
        <div
          key={`bottom-repeated-${idx}`}
          className="absolute flex gap-[.825rem]"
          style={{ bottom: "1.6rem", right: block.right }}
        >
          {Array.from({ length: 4 }).map((_, index) => (
            <p key={index}>{encoding[0]}</p>
          ))}
        </div>
      ))}

      {/* Bottom data blocks */}
      {bottomDataBlocks.map((block, idx) => (
        <div
          key={`bottom--${idx}`}
          className="flex absolute gap-[.84rem]"
          style={{ bottom: "1.6rem", right: block.right }}
        >
          {Array.from(encoding).slice(...block.slice).map((item, index) => (
            <p key={index}>{item}</p>
          ))}
        </div>
      ))}
    </div>
  );
};

export default TypeJImmDecode;
