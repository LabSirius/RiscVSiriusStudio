import React, { useState, useRef } from "react";
import { Grid2x2Plus } from "lucide-react";
import { useMemoryTable } from "@/context/MemoryTableContext";

const MemorySizeInput = () => {
  const { sizeMemory, setSizeMemory } = useMemoryTable();
  const [inputValue, setInputValue] = useState<string>(sizeMemory.toString());
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateInput = (value: number): string | null => {
    if (isNaN(value)) return "Please enter a valid number";
    if (value < 32) return "Value must be at least 32";
    if (value > 512) return "Value must be at most 512";
    if (value % 4 !== 0) return "Value must be a multiple of 4";
    return null;
  };

  const updateMemorySize = (value: number) => {
    const validationError = validateInput(value);
    if (validationError) {
      setError(validationError);
      return false;
    }
    
    setError(null);
    setSizeMemory(value);


    setInputValue(value.toString());
    return true;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const intValue = Number(inputValue);
    updateMemorySize(intValue);
    inputRef.current?.blur();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setError(null);
  };

  const handleBlur = () => {
    const intValue = Number(inputValue);
    if (!updateMemorySize(intValue)) {
      // Reset to last valid value if invalid
      setInputValue(sizeMemory.toString());
    }
  };


  return (
    <form onSubmit={handleSubmit} className="relative" noValidate>
      <div className="absolute top-1/2 left-[0.6rem] -translate-y-1/2 text-gray-400">
        <Grid2x2Plus strokeWidth={1} width={20} height={20} />
      </div>
      <input
        ref={inputRef}
        className={`relative rounded-lg border ${
          error ? "border-red-500" : "border-gray-400"
        } cursor-pointer z-[2] bg-transparent py-2 pr-2 pl-[2.3rem] w-full`}
        type="number"
        value={inputValue}
        min="32"
        max="512"
        step="4"
        placeholder="e.g. 200, 1024..."
        onChange={handleChange}
        onBlur={handleBlur}
        title={error || ""}
      />
      
      {error && (
        <div className="absolute left-0 mt-1 text-sm text-red-500 top-full">
          {error}
        </div>
      )}
    </form>
  );
};

export default MemorySizeInput;