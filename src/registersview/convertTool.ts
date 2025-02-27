export function setUpConvert() {
  const checkAndSwap = document.getElementById('checkAndSwap') as HTMLDivElement;
  const checkContainer = document.getElementById('checkIsNegativeContainer') as HTMLDivElement;
  const isNegativeCheck = document.getElementById('isNegative') as HTMLInputElement;

  function setupDropdown(
    inputId: string,
    optionsId: string,
    defaultValue: string,
    defaultText: string
  ): void {
    const inputElement = document.getElementById(inputId) as HTMLInputElement;
    const optionsElement = document.getElementById(optionsId) as HTMLDivElement;
    const numberInput = document.getElementById('numberToconvertInput') as HTMLInputElement;

    inputElement.value = defaultText;
    inputElement.dataset.value = defaultValue;

    inputElement.addEventListener('click', () => {
      optionsElement.classList.toggle('hidden');
    });

    optionsElement
      .querySelectorAll<HTMLParagraphElement>('.option-convert')
      .forEach((option) => {
        option.addEventListener('click', (event) => {
          const target = event.target as HTMLParagraphElement;
          inputElement.value = target.innerText;
          inputElement.dataset.value = target.dataset.value || '';
          optionsElement.classList.add('hidden');
          
          if (inputId === 'fromConvertInput') {
            if (target.dataset.value === 'twoCompl') {
              checkAndSwap.classList.remove('justify-end');
              checkAndSwap.classList.add('justify-between');
              checkContainer.classList.remove('display-none');
              isNegativeCheck.checked = false;
              numberInput.value = '0000 0000 0000 0000 0000 0000 0000 0000';
            } else {
              checkAndSwap.classList.remove('justify-between');
              checkAndSwap.classList.add('justify-end');
              checkContainer.classList.add('display-none');
              isNegativeCheck.checked = false;
              numberInput.value = '';
            }
          }
          
          convertNumber();
        });
      });

    document.addEventListener('click', (event) => {
      if (
        !inputElement.contains(event.target as Node) &&
        !optionsElement.contains(event.target as Node)
      ) {
        optionsElement.classList.add('hidden');
      }
    });
  }

  function processTwoComplementInput(inputValue: string): string {
    let cleanValue = inputValue.replace(/[^01]/g, '');
    const padChar = isNegativeCheck.checked ? '1' : '0';
    cleanValue = cleanValue.slice(-32); 
    cleanValue = cleanValue.padStart(32, padChar);
    return cleanValue.replace(/(.{4})(?=.)/g, '$1 ');
  }

  function handleInputClick(event: MouseEvent) {
    const input = event.target as HTMLInputElement;
    if (input.id === 'numberToconvertInput') {
      requestAnimationFrame(() => {
        input.setSelectionRange(input.value.length, input.value.length);
      });
    }
  }

  isNegativeCheck.addEventListener('change', () => {
    const numberInput = document.getElementById('numberToconvertInput') as HTMLInputElement;
    const fromBase = (document.getElementById('fromConvertInput') as HTMLInputElement).dataset.value;
    
    if (fromBase === 'twoCompl') {
      if (isNegativeCheck.checked) {
        numberInput.value = '1111 1111 1111 1111 1111 1111 1111 1111';
      } else {
        numberInput.value = '0000 0000 0000 0000 0000 0000 0000 0000';
      }
      convertNumber();
    }
  });

  function convertNumber(): void {
    const fromInput = document.getElementById('fromConvertInput') as HTMLInputElement;
    const toInput = document.getElementById('toConvertInput') as HTMLInputElement;
    const numberInput = document.getElementById('numberToconvertInput') as HTMLInputElement;
    const resultInput = document.getElementById('resultConvertInput') as HTMLInputElement;

    const fromBase = fromInput.dataset.value as string;
    const toBase = toInput.dataset.value as string;
    
    // Actualiza visibilidad según two's complement
    checkContainer.classList.toggle('hidden', fromBase !== 'twoCompl');

    if (fromBase === 'twoCompl') {
      const processed = processTwoComplementInput(numberInput.value);
      if (numberInput.value !== processed) {
        numberInput.value = processed;
      }
    } else {
      numberInput.value = numberInput.value.replace(/ /g, '');
    }

    const rawValue = numberInput.value.replace(/ /g, '');
    let decimalValue: number;

    try {
      if (fromBase === 'hex') {
        decimalValue = parseInt(rawValue, 16);
      } else if (fromBase === 'dec') {
        decimalValue = parseInt(rawValue, 10);
      } else if (fromBase === 'twoCompl') {
        const padChar = isNegativeCheck.checked ? '1' : '0';
        const bits = rawValue.padStart(32, padChar);
        decimalValue = parseInt(bits, 2);
        if (bits[0] === '1') {
          decimalValue -= 0x100000000;
        }
      } else {
        throw new Error('Formato inválido');
      }

      if (isNaN(decimalValue)) {
        throw new Error('Valor inválido');
      }
    } catch {
      resultInput.value = '';
      return;
    }

    if (toBase === 'hex') {
      if (fromBase === 'dec' && decimalValue < 0) {
        const twosComplement = ((0x10000 + (decimalValue % 0x10000)) & 0xFFFF);
        resultInput.value = twosComplement.toString(16).toUpperCase().padStart(4, '0');
      } else {
        resultInput.value = decimalValue.toString(16).toUpperCase();
      }
    } else if (toBase === 'dec') {
      if (fromBase === 'hex') {
        const unsignedValue = decimalValue;
        let signedValue = decimalValue;
        if (rawValue.length <= 4) {
          if (unsignedValue > 0x7FFF) {
            signedValue = unsignedValue - 0x10000;
          }
        } else {
          if (unsignedValue > 0x7FFFFFFF) {
            signedValue = unsignedValue - 0x100000000;
          }
        }
        if(signedValue.toString(10) === unsignedValue.toString(10)) {
          resultInput.value = signedValue.toString(10);
        } else {
        resultInput.value = signedValue.toString(10) + " / " + unsignedValue.toString(10);
        }
      } else {
        resultInput.value = decimalValue.toString(10); 
      }
    } else if (toBase === 'twoCompl') {
      let binary: string;
      if (isNegativeCheck.checked) {
        binary = (decimalValue | 0xFFFFFFFF).toString(2).slice(-32);
      } else {
        binary = (decimalValue >>> 0).toString(2).padStart(32, '0');
      }
      resultInput.value = binary.replace(/(.{4})(?=.)/g, '$1 ');
    }
  }

  setupDropdown('fromConvertInput', 'fromOptions', 'dec', 'Decimal');
  setupDropdown('toConvertInput', 'toOptions', 'hex', 'Hexadecimal');
  checkContainer.classList.add('hidden');

  document.addEventListener('click', handleInputClick);

  document.getElementById('numberToconvertInput')?.addEventListener('input', () => {
    const fromBase = (document.getElementById('fromConvertInput') as HTMLInputElement).dataset.value;
    if (fromBase === 'twoCompl') {
      const currentValue = (document.getElementById('numberToconvertInput') as HTMLInputElement).value;
      const cleaned = currentValue.replace(/ /g, '');
      const padChar = isNegativeCheck.checked ? '1' : '0';
      const newValue = cleaned.slice(-32).padStart(32, padChar).replace(/(.{4})(?=.)/g, '$1 ');
      
      if (currentValue !== newValue) {
        (document.getElementById('numberToconvertInput') as HTMLInputElement).value = newValue;
      }
      convertNumber();
    } else {
      setTimeout(convertNumber, 0);
    }
  });

  document.getElementById('SwapConvertBtn')?.addEventListener('click', () => {
    const from = document.getElementById('fromConvertInput') as HTMLInputElement;
    const to = document.getElementById('toConvertInput') as HTMLInputElement;
    [from.value, to.value] = [to.value, from.value];
    [from.dataset.value, to.dataset.value] = [to.dataset.value!, from.dataset.value!];
    
    checkContainer.classList.toggle('hidden', from.dataset.value !== 'twoCompl');
    
    convertNumber();
  });
}
