import { useCurrentInst } from '@/context/graphic/CurrentInstContext';

const TypeUImmDecode = () => {
  const { currentInst } = useCurrentInst();
  

  const topBlocks = [
    { left: "1.15rem", slice: [0, 4] },
    { left: "6.1rem", slice: [4, 8] },
    { left: "11.1rem", slice: [8, 12] },
    { left: "16.1rem", slice: [12, 16] },
    { left: "21.1rem", slice: [16, 20] },

  ];



  const bottomDataBlocks = [
    { right: "39.55rem", slice: [0, 4] },
    { right: "34.6rem", slice: [4, 8] },
    { right: "29.63rem", slice: [8, 12] },
    { right: "24.7rem", slice: [12, 16] },
    { right: "19.8rem", slice: [16, 20] },
  ];

  const bottomRepeatedBlocks = [
    { right: "14.8rem" },
    { right: "9.89rem" },
    { right: "4.93rem" },
  ];

  return (
    <div className="w-full z-100000 max-h-[30rem] text-[.75rem] text-black overflow-hidden font-mono relative">
      <img
        src="immTypeUDecode.svg"
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

      {bottomDataBlocks.map((block, idx) => (
        <div
          key={`bottom--${idx}`}
          className="flex absolute gap-[.83rem]"
          style={{ bottom: "1.6rem", right: block.right }}
        >
          {Array.from(currentInst.encoding.binEncoding).slice(...block.slice).map((item, index) => (
            <p key={index}>{item}</p>
          ))}
        </div>
      ))}

        {bottomRepeatedBlocks.map((block, idx) => (
        <div
          key={`bottom-repeated-${idx}`}
          className="absolute flex gap-[.81rem]"
          style={{ bottom: "1.6rem", right: block.right }}
        >
          {Array.from({ length: 4 }).map((_, index) => (
            <p key={index}>0</p>
          ))}
        </div>
      ))}
    </div>
  );
};

export default TypeUImmDecode;