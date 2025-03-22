import React, { InputHTMLAttributes } from 'react';
import { Hash } from 'lucide-react';

interface ValueInputProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
}

const ValueInput: React.FC<ValueInputProps> = ({ id, ...props }) => {
  return (
    <div className="flex flex-col gap-1">
      <p className="">Value</p>
      <div className="relative">
        <div className="absolute top-1/2 left-[0.6rem] -translate-y-1/2 text-gray-400">
          <Hash width={20} height={20} strokeWidth={1} />
        </div>
        <input
          id={id}
          type="text"
          className="relative text-[.93rem] rounded-lg border border-gray-400 cursor-pointer z-[2] bg-transparent py-2 pr-2 pl-[2.3rem] w-full"
          {...props}
        />
      </div>
    </div>
  );
};

export default ValueInput;
