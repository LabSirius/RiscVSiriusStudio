import { ChevronDown, Hash, ArrowLeftRight, Copy, X } from "lucide-react";

const Convert = () => {
  return (
    <div id="openConvert1" className="flex flex-1">
      <div className="flex flex-col gap-4 w-min p-4">
        <div className="flex gap-2">
          {/* From container */}
          <div className="flex flex-col gap-1 relative">
            <p className="label">From</p>
            <div className="relative">
              <input
                type="text"
                id="fromConvertInput"
                className="relative rounded-lg border border-gray-400 cursor-pointer z-[2] bg-transparent py-2 pl-2 pr-[2.3rem] w-[10.8rem]"
                readOnly
              />
              <div className="absolute top-1/2 right-[0.6rem] -translate-y-1/2 z-[1] cursor-pointer text-gray-400">
                <ChevronDown width={24} height={24} strokeWidth={1} />
              </div>
            </div>
            <div id="fromOptions" className="hidden">
              <div className="absolute mt-4 rounded-lg bg-white p-2 flex flex-col gap-2 z-[100] shadow-[0_0_10px_0_rgba(0,0,0,0.1)]">
                <p
                  className="py-[0.3rem] px-[0.6rem] rounded-[0.2rem] cursor-pointer border-b border-[#D1E3E7] text-black hover:bg-[#D1E3E7] hover:text-black"
                  data-value="twoCompl"
                >
                  Two's complement
                </p>
                <p
                  className="py-[0.3rem] px-[0.6rem] rounded-[0.2rem] cursor-pointer border-b border-[#D1E3E7] text-black hover:bg-[#D1E3E7] hover:text-black"
                  data-value="hex"
                >
                  Hexadecimal
                </p>
                <p
                  className="py-[0.3rem] px-[0.6rem] rounded-[0.2rem] cursor-pointer border-b border-[#D1E3E7] text-black hover:bg-[#D1E3E7] hover:text-black"
                  data-value="dec"
                >
                  Decimal
                </p>
                <p
                  className="py-[0.3rem] px-[0.6rem] rounded-[0.2rem] cursor-pointer border-b border-[#D1E3E7] text-black hover:bg-[#D1E3E7] hover:text-black"
                  data-value="ascii"
                >
                  ASCII
                </p>
              </div>
            </div>
          </div>

          {/* To container */}
          <div className="flex flex-col gap-1 relative">
            <p className="label">To</p>
            <div className="relative">
              <input
                type="text"
                id="toConvertInput"
                className="relative rounded-lg border border-gray-400 cursor-pointer z-[2] bg-transparent py-2 pl-2 pr-[2.3rem] w-[10.8rem]"
                readOnly
              />
              <div className="absolute top-1/2 right-[0.6rem] -translate-y-1/2 z-[1] cursor-pointer text-gray-400">
                <ChevronDown width={24} height={24} strokeWidth={1} />
              </div>
            </div>
            <div id="toOptions" className="hidden">
              <div className="absolute mt-4 rounded-lg bg-white p-2 flex flex-col gap-2 z-[100] shadow-[0_0_10px_0_rgba(0,0,0,0.1)]">
                <p
                  className="py-[0.3rem] px-[0.6rem] rounded-[0.2rem] cursor-pointer border-b border-[#D1E3E7] text-black hover:bg-[#D1E3E7] hover:text-black"
                  data-value="twoCompl"
                >
                  Two's complement
                </p>
                <p
                  className="py-[0.3rem] px-[0.6rem] rounded-[0.2rem] cursor-pointer border-b border-[#D1E3E7] text-black hover:bg-[#D1E3E7] hover:text-black"
                  data-value="hex"
                >
                  Hexadecimal
                </p>
                <p
                  className="py-[0.3rem] px-[0.6rem] rounded-[0.2rem] cursor-pointer border-b border-[#D1E3E7] text-black hover:bg-[#D1E3E7] hover:text-black"
                  data-value="dec"
                >
                  Decimal
                </p>
                <p
                  className="py-[0.3rem] px-[0.6rem] rounded-[0.2rem] cursor-pointer border-b border-[#D1E3E7] text-black hover:bg-[#D1E3E7] hover:text-black"
                  data-value="ascii"
                >
                  ASCII
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Value input */}
        <div className="flex flex-col gap-1">
          <p className="label">Value</p>
          <div className="relative">
            <div className="absolute top-1/2 left-[0.6rem] -translate-y-1/2 text-gray-400">
              <Hash width={20} height={20} strokeWidth={1} />
            </div>
            <input
              type="text"
              id="numberToconvertInput"
              className="relative rounded-lg border border-gray-400 cursor-pointer z-[2] bg-transparent py-2 pr-2 pl-[2.3rem] w-full"
            />
          </div>
        </div>

        {/* Checkbox and Swap Button */}
        <div className="flex gap-4 justify-between items-center w-full relative h-10">
          <div id="checkIsNegativeContainer" className="hidden">
            <div className="flex gap-2 items-center">
              <input type="checkbox" id="isNegative" className="cursor-pointer" />
              <p className="label">Fill with ones (negative)</p>
            </div>
          </div>
          <div id="checkbox-swapContainer" className="absolute top-1/2 right-0 -translate-y-1/2">
            <button
              className="text-center bg-[#D1E3E7] border border-[#D1E3E7] text-black rounded-lg p-[0.4rem] cursor-pointer transition-all duration-300 ease-in hover:scale-95 sim-focus"
              id="SwapConvertBtn"
            >
              <ArrowLeftRight width={22} height={22} strokeWidth={1} />
            </button>
          </div>
        </div>

        {/* Result input and Copy Options */}
        <div className="flex flex-col gap-2">
          <p className="label">Result :</p>
          <div className="relative">
            <input
              type="text"
              id="resultConvertInput"
              className="p-2 pr-[2.2rem] rounded-lg w-[22rem] border border-[#3A6973] bg-transparent focus:outline-none hover:outline-none relative"
              readOnly
            />
            <div
              id="copyResultButton"
              className="sim-focus absolute top-1/2 right-[0.6rem] -translate-y-1/2 text-gray-400"
          
            >
              <Copy width={22} height={22} strokeWidth={1} />
            </div>
            <div
              id="closeOptionsCopy"
              className="hidden sim-focus absolute top-1/2 right-[0.6rem] -translate-y-1/2 text-gray-400"
         
            >
              <X width={24} height={24} strokeWidth={2} />
            </div>
            <ul
              id="options-copy"
              className=" absolute mt-2 right-0 rounded-lg bg-white p-2 flex gap-2 z-[100] shadow-[0_0_10px_0_rgba(0,0,0,0.1)] animate-fadeInTop"
            >
              <li className="py-[0.3rem] px-[0.6rem] rounded-[0.2rem] cursor-pointer border-b border-[#D1E3E7] text-black active:scale-[0.98]">
                32 bits
              </li>
              <li className="py-[0.3rem] px-[0.6rem] rounded-[0.2rem] cursor-pointer border-b border-[#D1E3E7] text-black active:scale-[0.98]">
                16 bits
              </li>
              <li className="py-[0.3rem] px-[0.6rem] rounded-[0.2rem] cursor-pointer border-b border-[#D1E3E7] text-black active:scale-[0.98]">
                8 bits
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Convert;
