import { usePC } from '@/context/shared/PCContext';
import { useIR } from '@/context/graphic/IRContext';

const TypeSImmDecode = () => {
  const { ir } = useIR();
  const { newPc } = usePC();

  const topBlocks = [
    { left: "1.1rem", slice: [0, 4] },
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
    { right: "14.9rem", slice: [0, 4] },
    { right: "11.2rem", slice: [4, 7] },
    { right: "5rem", slice: [20, 25] },
  ];

  return (
    <div className="w-full max-h-[30rem] text-[.75rem] text-black overflow-hidden font-mono relative">
      <img
        src="immTypeSDecode.svg"
        alt="immDecode"
        className="w-full h-full rounded-md"
      />

      {topBlocks.map((block, idx) => (
        <div
          key={`top-${idx}`}
          className="absolute flex gap-[.82rem]"
          style={{ top: "2.7rem", left: block.left }}
        >
          {Array.from(ir.instructions[newPc].encoding.binEncoding).slice(...block.slice).map((item, index) => (
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
            <p key={index}>{ir.instructions[newPc].encoding.binEncoding[0]}</p>
          ))}
        </div>
      ))}

      {bottomDataBlocks.map((block, idx) => (
        <div
          key={`bottom-ir.instructions[newPc].encoding.binEncoding-${idx}`}
          className="flex absolute gap-[.84rem]"
          style={{ bottom: "1.6rem", right: block.right }}
        >
          {Array.from(ir.instructions[newPc].encoding.binEncoding).slice(...block.slice).map((item, index) => (
            <p key={index}>{item}</p>
          ))}
        </div>
      ))}
    </div>
  );
};

export default TypeSImmDecode;