import React, { InputHTMLAttributes } from 'react';

interface ResultOutputProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
}

const ResultOutput: React.FC<ResultOutputProps> = ({ id, ...props }) => {
  return (
    <div className="flex flex-col gap-2">
      <p className="label">Result :</p>
      <div className="relative">
        <input
          id={id}
          type="text"
          readOnly
          className="p-2 pr-[2.2rem] text-[0.93rem] rounded-lg w-full border border-[#3A6973] bg-transparent focus:outline-none hover:outline-none relative"
          {...props}
        />
      </div>
    </div>
  );
};

export default ResultOutput;
