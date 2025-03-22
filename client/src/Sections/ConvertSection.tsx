import React, { useState, useEffect } from 'react';
import { useRoutes } from '@/context/RoutesContext';
import { useNavigate } from 'react-router-dom';
import Dropdown, { Option } from "@/components/Convert/Dropdown";
import ValueInput from "@/components/Convert/ValueInput";
import ResultOutput from "@/components/Convert/ResultOutput";
import SwapButton from "@/components/Convert/SwapButton";
import CopyButton from "@/components/Convert/CopyButton";
import { processTwoComplementInput, convertValue } from "@/utils/convert";

// Available format options
const formatOptions: Option[] = [
  { label: "Two's complement", value: 'twoCompl' },
  { label: "Hexadecimal", value: 'hex' },
  { label: "Decimal", value: 'dec' },
  { label: "ASCII", value: 'ascii' },
];

const ConvertSection: React.FC = () => {

  const { routes } = useRoutes();
  const navigate = useNavigate();

  // State for source format, target format, input value, conversion result and negative flag
  const [fromFormat, setFromFormat] = useState<Option>(formatOptions[0]);
  const [toFormat, setToFormat] = useState<Option>(formatOptions[1]);
  const [inputValue, setInputValue] = useState<string>('');
  const [result, setResult] = useState<string>('');
  const [isNegative, setIsNegative] = useState<boolean>(false);

  useEffect(() => {
    if (routes === 'uploadMemory') {
      navigate('/settings');
    }
}, [routes, navigate]);

  // Update input when Two's Complement format or negative flag changes
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

  // Update conversion result whenever input or formats change
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

  // Swap the "from" and "to" formats
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

  return (
      <div className="section-container">
        <div className="flex gap-2">
          {/* From format dropdown */}
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
          {/* To format dropdown */}
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

        {/* Input for the value */}
        <ValueInput
          id="numberToconvertInput"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />

        {/* Checkbox for Two's Complement and swap button */}
        <div className="flex gap-4 justify-between items-center w-full relative h-10">
          {fromFormat.value === 'twoCompl' && (
            <div>
              <div className="flex gap-2 items-center">
                <input
                  type="checkbox"
                  id="isNegative"
                  className="cursor-pointer"
                  checked={isNegative}
                  onChange={(e) => setIsNegative(e.target.checked)}
                />
                <p >Fill with ones (negative)</p>
              </div>
            </div>
          )}
          <div id="checkbox-swapContainer" className="absolute top-1/2 right-0 -translate-y-1/2">
            <SwapButton onSwap={handleSwap} />
          </div>
        </div>

        {/* Result output and copy button */}
        <div className="flex flex-col gap-2 relative max-h-content">
          <ResultOutput id="resultConvertInput" value={result} />
          <CopyButton result={result} toFormat={toFormat.value} />
        </div>
      </div>
  );
};

export default ConvertSection;
