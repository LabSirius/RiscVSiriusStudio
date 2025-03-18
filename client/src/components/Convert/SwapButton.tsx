// src/components/Convert/SwapButton.tsx
import React from 'react';
import { ArrowLeftRight } from 'lucide-react';

interface SwapButtonProps {
  onSwap: () => void;
}

const SwapButton: React.FC<SwapButtonProps> = ({ onSwap }) => {
  return (
    <button 
      className="text-center bg-[#D1E3E7] border border-[#D1E3E7] text-black rounded-md p-[0.2rem] cursor-pointer transition-all duration-300 ease-in hover:scale-95 sim-focus"
      onClick={onSwap}
    >
      <ArrowLeftRight width={18} height={18} strokeWidth={1} />
    </button>
  );
};

export default SwapButton;
