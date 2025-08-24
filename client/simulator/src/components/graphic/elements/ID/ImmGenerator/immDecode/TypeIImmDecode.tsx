import { useCurrentInst } from '@/context/graphic/CurrentInstContext';

const TypeIImmDecode = () => {
  const { currentMonocycletInst } = useCurrentInst();
  if(!currentMonocycletInst) return


  const topBlocks = [
    { left: "1.1rem", slice: [0, 4] },
    { left: "6rem", slice: [4, 8] },
    { left: "11rem", slice: [8, 12] },
  ];

  const bottomRepeatedBlocks = [
    { right: "39.8rem" },
    { right: "34.8rem" },
    { right: "29.85rem" },
    { right: "24.85rem" },
    { right: "19.9rem" },
  ];

  const bottomDataBlocks = [
    { right: "14.9rem", slice: [0, 4] },
    { right: "9.9rem", slice: [4, 8] },
    { right: "5rem", slice: [8, 12] },
  ];

  return (
    <div className="w-full max-h-[30rem] z-100000 text-[.75rem] text-black overflow-hidden font-mono relative">
      <img
        src="immTypeIDecode.svg"
        alt="immDecode"
        className="w-full h-full rounded-md"
      />

      {topBlocks.map((block, idx) => (
        <div
          key={`top-${idx}`}
          className="absolute flex gap-[.79rem]"
          style={{ top: "2.5rem", left: block.left }}
        >
          {Array.from(currentMonocycletInst?.encoding.binEncoding).slice(...block.slice).map((item, index) => (
            <p key={index}>{item}</p>
          ))}
        </div>
      ))}

      {bottomRepeatedBlocks.map((block, idx) => (
        <div
          key={`bottom-repeated-${idx}`}
          className="absolute flex gap-[.83rem]"
          style={{ bottom: "1.6rem", right: block.right }}
        >
          {Array.from({ length: 4 }).map((_, index) => (
            <p key={index}>{currentMonocycletInst?.encoding.binEncoding[0]}</p>
          ))}
        </div>
      ))}

      {bottomDataBlocks.map((block, idx) => (
        <div
          key={`bottom--${idx}`}
          className="flex absolute gap-[.84rem]"
          style={{ bottom: "1.6rem", right: block.right }}
        >
          {Array.from(currentMonocycletInst?.encoding.binEncoding).slice(...block.slice).map((item, index) => (
            <p key={index}>{item}</p>
          ))}
        </div>
      ))}
    </div>
  );
};

export default TypeIImmDecode;