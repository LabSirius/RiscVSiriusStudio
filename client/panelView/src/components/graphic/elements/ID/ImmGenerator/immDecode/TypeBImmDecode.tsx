import { useCurrentInst } from '@/context/graphic/CurrentInstContext';

const TypeBImmDecode = () => {
  const { currentInst } = useCurrentInst();
  

  const topBlocks = [
    { left: "1.15rem", slice: [0, 4] },
    { left: "6.1rem", slice: [4, 7] },
    { left: "25.9rem", slice: [20, 25] },
  ];

  const bottomRepeatedBlocks = [
    { right: "39.7rem" },
    { right: "34.7rem" },
    { right: "29.75rem" },
    { right: "24.8rem" },
    { right: "19.8rem" },
  ];

  const bottomDataBlocks = [
    { right: "14.85rem", slice: [1, 4] },
    { right: "11.2rem", slice: [4, 7] },
    { right: "6.22rem", slice: [20, 24] },
  ];

  return (
    <div className="w-full max-h-[30rem] text-[.75rem] text-black overflow-hidden font-mono relative">
      <img
        src="immTypeBDecode.svg"
        alt="immDecode"
        className="w-full h-full rounded-md"
      />

      {topBlocks.map((block, idx) => (
        <div
          key={`top-${idx}`}
          className="absolute flex gap-[.82rem]"
          style={{ top: "2.7rem", left: block.left }}
        >
          {Array.from(currentInst.encoding.binEncoding).slice(...block.slice).map((item, index) => (
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
            <p key={index}>{currentInst.encoding.binEncoding[0]}</p>
          ))}
        </div>
      ))}

      <p className='absolute bottom-[1.6rem] right-[18.59rem]'>{currentInst.encoding.binEncoding[24]}</p>

      {bottomDataBlocks.map((block, idx) => (
        <div
          key={`bottom-${idx}`}
          className="flex absolute gap-[.83rem]"
          style={{ bottom: "1.6rem", right: block.right }}
        >
          {Array.from(currentInst.encoding.binEncoding).slice(...block.slice).map((item, index) => (
            <p key={index}>{item}</p>
          ))}
        </div>
      ))}

      <p className='absolute bottom-[1.6rem] right-[4.98rem]'>0</p>
    </div>
  );
};

export default TypeBImmDecode;