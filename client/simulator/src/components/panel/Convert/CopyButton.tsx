// src/components/Convert/CopyButton.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Copy, X } from 'lucide-react';

interface CopyButtonProps {
  result: string;
  toFormat: string;
}

const CopyButton: React.FC<CopyButtonProps> = ({ result, toFormat }) => {
  const [showOptions, setShowOptions] = useState(false);
  const optionsRef = useRef<HTMLUListElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);

  // Function to copy text to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // Close the menu if click occurs outside the button and menu
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        optionsRef.current &&
        !optionsRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setShowOptions(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // On button click:
  // - If target format is "twoCompl", toggle the menu (no copying yet).
  // - Otherwise, copy the result directly.
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (toFormat === 'twoCompl') {
      setShowOptions((prev) => !prev);
    } else {
      copyToClipboard(result);
    }
  };

  // When an option is selected, copy the corresponding bits and close the menu
  const handleOptionClick = (bits: number) => {
    const binary = result.replace(/ /g, '');
    const textToCopy = bits === 32 ? binary : binary.slice(-bits);
    copyToClipboard(textToCopy);
    setShowOptions(false);
  };

  return (
    <div className="absolute top-[2.3rem] right-[0.6rem] text-gray-400 cursor-pointer z-1">
      <div ref={buttonRef} onClick={handleClick} className="z-10 text-gray-400 cursor-pointer">
        {toFormat === 'twoCompl'
          ? (showOptions ? <X width={24} height={24} strokeWidth={2} /> : <Copy width={22} height={22} strokeWidth={1} />)
          : <Copy className='transition ease-in 300 transform hover:scale-[0.95]' width={22} height={22} strokeWidth={1} />}
      </div>
      {toFormat === 'twoCompl' && showOptions && (
        <ul
          ref={optionsRef}
          className="absolute top-[2.5rem] right-[-.5rem] w-max rounded-lg bg-white p-2 flex gap-2 z-[100] shadow-[0_0_10px_0_rgba(0,0,0,0.1)] animate-fadeInTop"
        >
          <li
            className="py-[0.3rem] px-[0.6rem] rounded cursor-pointer border-b border-[#D1E3E7] text-black active:scale-[0.98] whitespace-nowrap"
            onClick={() => handleOptionClick(32)}
          >
            32 bits
          </li>
          <li
            className="py-[0.3rem] px-[0.6rem] rounded cursor-pointer border-b border-[#D1E3E7] text-black active:scale-[0.98] whitespace-nowrap"
            onClick={() => handleOptionClick(16)}
          >
            16 bits
          </li>
          <li
            className="py-[0.3rem] px-[0.6rem] rounded cursor-pointer border-b border-[#D1E3E7] text-black active:scale-[0.98] whitespace-nowrap"
            onClick={() => handleOptionClick(8)}
          >
            8 bits
          </li>
        </ul> 
      )}
    </div>
  );  
};

export default CopyButton;
