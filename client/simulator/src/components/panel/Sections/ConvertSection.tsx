import React, { useState, useEffect } from 'react';
import { ArrowBigLeftDash, ArrowBigRightDash } from "lucide-react";
import Dropdown, { Option } from "@/components/panel/Convert/Dropdown";
import ValueInput from "@/components/panel/Convert/ValueInput";
import ResultOutput from "@/components/panel/Convert/ResultOutput";
import SwapButton from "@/components/panel/Convert/SwapButton";
import CopyButton from "@/components/panel/Convert/CopyButton";
import { processTwoComplementInput, convertValue } from "@/utils/tables/convert";

const formatOptions: Option[] = [
  { label: "Two's complement", value: 'twoCompl' },
  { label: "Hexadecimal", value: 'hex' },
  { label: "Decimal", value: 'dec' },
  { label: "ASCII", value: 'ascii' },
];

interface ConvertSectionProps {
  /** When true, the collapse control (header arrow) and collapsed tab are wired.
      Only the beside-tables view sets this; the standalone view stays expanded. */
  collapsible?: boolean;
  /** Collapse state, owned by the parent so it survives convert↔help toggles. */
  collapsed?: boolean;
  onToggle?: (collapsed: boolean) => void;
}

const ConvertSection: React.FC<ConvertSectionProps> = ({
  collapsible = false,
  collapsed = false,
  onToggle,
}) => {
  const [fromFormat, setFromFormat] = useState<Option>(formatOptions[0]);
  const [toFormat, setToFormat] = useState<Option>(formatOptions[1]);
  const [inputValue, setInputValue] = useState<string>('');
  const [result, setResult] = useState<string>('');
  const [isNegative, setIsNegative] = useState<boolean>(false);

  useEffect(() => {
    if (fromFormat.value === 'twoCompl') {
      setInputValue(
        isNegative
          ? '1111 1111 1111 1111 1111 1111 1111 1111'
          : '0000 0000 0000 0000 0000 0000 0000 0000'
      );
    } else {
      setInputValue('');
    }
  }, [fromFormat, isNegative]);

  useEffect(() => {
    let processedValue = inputValue;
    if (fromFormat.value === 'twoCompl') {
      processedValue = processTwoComplementInput(inputValue, isNegative);
      if (processedValue !== inputValue) {
        setInputValue(processedValue);
      }
    } else if (fromFormat.value !== 'ascii') {
      processedValue = inputValue.replace(/ /g, '');
    }
    const convResult = convertValue(processedValue, fromFormat.value, toFormat.value, isNegative);
    setResult(convResult);
  }, [inputValue, fromFormat, toFormat, isNegative]);

  const handleSwap = () => {
    const temp = fromFormat;
    setFromFormat(toFormat);
    setToFormat(temp);
    setInputValue('');
    setResult('');
    if (toFormat.value === 'twoCompl') {
      setIsNegative(false);
      setInputValue('0000 0000 0000 0000 0000 0000 0000 0000');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newVal = e.target.value;
    if (fromFormat.value === 'twoCompl') {
      newVal = newVal.replace(/[^01]/g, '');
    }
    setInputValue(newVal);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (fromFormat.value === 'twoCompl' && e.key === 'Backspace') {
      e.preventDefault();
      const newVal = '0' + inputValue.slice(0, -1);
      setInputValue(newVal);
    }
  };

  return (
    <>
      <div
        className="section-container ml-[.2rem]"
        style={{ display: collapsible && collapsed ? "none" : undefined }}>
        {/* Header band hosts the collapse arrow; styled like TableSearchBand so
            the calculator reads as a sibling of the collapsible tables. */}
        <div className="flex shrink-0 items-center rounded-t-md border-b border-gray-300 bg-gray-100 px-2 py-1 dark:border-zinc-700 dark:bg-zinc-800">
          <span className="text-sm font-semibold text-black dark:text-white">
            Base Convert
          </span>
          {collapsible && (
            <ArrowBigLeftDash
              id="closeConvert"
              onClick={() => onToggle?.(true)}
              strokeWidth={1.5}
              className="ml-auto min-w-[1.3rem] min-h-[1.3rem] w-[1.3rem] h-[1.3rem] cursor-pointer text-black dark:text-white"
            />
          )}
        </div>
      <div className="flex gap-2">
        <Dropdown
          label="From"
          inputId="fromConvertInput"
          options={formatOptions}
          selected={fromFormat}
          onSelect={(option) => {
            setFromFormat(option);
            setInputValue('');
            setResult('');
          }}
        />
        <Dropdown
          label="To"
          inputId="toConvertInput"
          options={formatOptions}
          selected={toFormat}
          onSelect={(option) => {
            setToFormat(option);
            setResult('');
          }}
        />
      </div>

      <ValueInput
        id="numberToconvertInput"
        value={inputValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onClick={(e) => {
          const target = e.target as HTMLInputElement;
          target.setSelectionRange(target.value.length, target.value.length);
        }}
      />

      <div className="relative flex items-center justify-between w-full h-10 gap-4">
        {fromFormat.value === 'twoCompl' && (
          <div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isNegative"
                className="cursor-pointer"
                checked={isNegative}
                onChange={(e) => setIsNegative(e.target.checked)}
              />
              <p>Fill with ones (negative)</p>
            </div>
          </div>
        )}
        <div id="checkbox-swapContainer" className="absolute right-0 -translate-y-1/2 top-1/2">
          <SwapButton onSwap={handleSwap} />
        </div>
      </div>

      <div className="relative flex flex-col gap-2 max-h-content">
        <ResultOutput id="resultConvertInput" value={result} />
        <CopyButton result={result} toFormat={toFormat.value} />
      </div>
      </div>
      {collapsible && collapsed && (
        <div
          onClick={() => onToggle?.(false)}
          className={`h-full w-[1.6rem] cursor-pointer rounded-[.2rem] border flex flex-col items-center uppercase hover:opacity-[0.9] transition-all ease-in-out duration-200
    bg-[#B2DFDB] border-gray-700 text-black`}>
          <ArrowBigRightDash
            strokeWidth={1.5}
            className={`mt-[0.35rem] mb-1  min-w-[.9rem] min-h-[.9rem] w-[.9rem] h-[.9rem]
      `}
          />
          {"base convert".split("").map((char, index) => (
            <span
              key={index}
              className={`text-[.45rem] font-bold leading-[.91rem]  ease-in-out
        `}>
              {char === " " ? " " : char}
            </span>
          ))}
        </div>
      )}
    </>
  );
};

export default ConvertSection;
