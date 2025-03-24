import React, { useState, useEffect } from 'react';
import Dropdown, { Option } from "@/components/Convert/Dropdown";
import ValueInput from "@/components/Convert/ValueInput";
import ResultOutput from "@/components/Convert/ResultOutput";
import SwapButton from "@/components/Convert/SwapButton";
import CopyButton from "@/components/Convert/CopyButton";
import { processTwoComplementInput, convertValue } from "@/utils/convert";

const formatOptions: Option[] = [
  { label: "Two's complement", value: 'twoCompl' },
  { label: "Hexadecimal", value: 'hex' },
  { label: "Decimal", value: 'dec' },
  { label: "ASCII", value: 'ascii' },
];

const ConvertSection: React.FC = () => {
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

  // Handler para filtrar la entrada (sólo 0 y 1) cuando estamos en Two's Complement
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newVal = e.target.value;
    if (fromFormat.value === 'twoCompl') {
      // Elimina cualquier carácter que no sea 0 o 1
      newVal = newVal.replace(/[^01]/g, '');
    }
    setInputValue(newVal);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (fromFormat.value === 'twoCompl' && e.key === 'Backspace') {
      e.preventDefault();
      // Quita el último dígito y agrega un "0" al inicio
      const newVal = '0' + inputValue.slice(0, -1);
      setInputValue(newVal);
    }
  };

  return (
    <div className="section-container">
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
  );
};

export default ConvertSection;
