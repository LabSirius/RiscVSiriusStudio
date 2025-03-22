import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

export interface Option {
  label: string;
  value: string;
}

interface DropdownProps {
  label?: string;
  options: Option[];
  selected: Option;
  onSelect: (option: Option) => void;
  inputId?: string;
}

const Dropdown: React.FC<DropdownProps> = ({ label, options, selected, onSelect, inputId }) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close the dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="relative flex flex-col gap-1 " ref={dropdownRef}>
      {label && <p className="label">{label}</p>}
      <div className="relative">
        <input
          type="text"
          id={inputId}
          className="relative rounded-lg border border-gray-400 cursor-pointer z-[2] bg-transparent py-2 pl-2 pr-[2.3rem] w-full"
          value={selected.label}
          readOnly
          onClick={() => setOpen(!open)}
        />
        <div className="absolute top-1/2 right-[0.6rem] -translate-y-1/2 z-[1] cursor-pointer text-gray-400">
          <ChevronDown width={24} height={24} strokeWidth={1} />
        </div>
      </div>
      {open && (
        <div className="absolute top-[4.3rem] right-0 rounded-lg bg-white p-2 flex flex-col gap-2 z-[100] shadow-[0_0_10px_0_rgba(0,0,0,0.1)]">
          {options.map((option) => (
            <p
              key={option.value}
              className="py-[0.3rem] px-[0.6rem] rounded-[0.2rem] cursor-pointer border-b border-[#D1E3E7] text-black hover:bg-[#D1E3E7] hover:text-black"
              onClick={() => {
                onSelect(option);
                setOpen(false);
              }}
            >
              {option.label}
            </p>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dropdown;
