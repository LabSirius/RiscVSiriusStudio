export function setUpConvert() {
  function setupDropdown(
    inputId: string,
    optionsId: string,
    defaultValue: string,
    defaultText: string
  ): void {
    const inputElement = document.getElementById(
      inputId
    ) as HTMLInputElement | null;
    const optionsElement = document.getElementById(
      optionsId
    ) as HTMLDivElement | null;
    if (!inputElement || !optionsElement) {
      return;
    }

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
          convertNumber();
        });
      });

    const checkbox32 = document.querySelector(
      "#checkbox32bits input[type='checkbox']"
    ) as HTMLInputElement | null;
    if (checkbox32) {
      checkbox32.addEventListener('change', convertNumber);
    }

    document.addEventListener('click', (event) => {
      if (
        !inputElement?.contains(event.target as Node) &&
        !optionsElement?.contains(event.target as Node)
      ) {
        optionsElement.classList.add('hidden');
      }
    });
  }

  function convertNumber(): void {
    const fromInput = document.getElementById(
      'fromConvertInput'
    ) as HTMLInputElement;
    const toInput = document.getElementById(
      'toConvertInput'
    ) as HTMLInputElement;
    const numberInput = document.getElementById(
      'numberToconvertInput'
    ) as HTMLInputElement;
    const resultInput = document.getElementById(
      'resultConvertInput'
    ) as HTMLInputElement;
    const copyButton = document.getElementById(
      'copyResultButton'
    ) as HTMLButtonElement;

    if (!fromInput || !toInput || !numberInput || !resultInput) {
      return;
    }

    const fromBase = fromInput.dataset.value as string;
    const toBase = toInput.dataset.value as string;
    const numberValue = numberInput.value.trim();

    if (!fromBase || !toBase || !numberValue) {
      resultInput.value = '';
      return;
    }

    const checkboxSwapContainer = document.getElementById(
      'checkbox-swapContainer'
    ) as HTMLDivElement;
    const checkbox32bits = document.getElementById('checkbox32bits');
    if (checkbox32bits) {
      if (toBase === 'bin') {
        checkboxSwapContainer.classList.remove('justify-end');
        checkboxSwapContainer.classList.add('justify-between');
        checkbox32bits.classList.add('flex');
        checkbox32bits.classList.remove('hidden');
      } else {
        checkboxSwapContainer.classList.remove('justify-between');
        checkboxSwapContainer.classList.add('justify-end');
        checkbox32bits.classList.add('hidden');
        checkbox32bits.classList.remove('flex');
      }
    }

    let decimalValue: number;
    try {
      if (fromBase === 'bin') {
        decimalValue = parseInt(numberValue, 2);
      } else if (fromBase === 'hex') {
        decimalValue = parseInt(numberValue, 16);
      } else if (fromBase === 'dec') {
        decimalValue = parseInt(numberValue, 10);
      } else if (fromBase === 'twoCompl') {
        const bitLength = numberValue.length;
        if (numberValue[0] === '1') {
          decimalValue = parseInt(numberValue, 2) - (1 << bitLength);
        } else {
          decimalValue = parseInt(numberValue, 2);
        }
      } else {
        throw new Error('Base inválida');
      }

      if (isNaN(decimalValue)) {
        throw new Error('Número inválido');
      }
    } catch {
      resultInput.value = 'Error';
      return;
    }

    let result: string;
    if (toBase === 'bin') {
      let use32bits = false;
      if (checkbox32bits) {
        const checkboxInput = checkbox32bits.querySelector(
          "input[type='checkbox']"
        ) as HTMLInputElement | null;
        if (checkboxInput && checkboxInput.checked) {
          use32bits = true;
        }
      }
      if (use32bits) {
        result = decimalValue.toString(2).padStart(32, '0');
        result = result.match(/.{4}/g)?.join(' ') || result;
      } else {
        result = decimalValue.toString(2);
        result = groupBinary(result);
      }
    } else if (toBase === 'hex') {
      result = decimalValue.toString(16).toUpperCase();
    } else if (toBase === 'dec') {
      result = decimalValue.toString(10);
    } else if (toBase === 'twoCompl') {
      let bitLength = 32;
      if (decimalValue < 0) {
        result = (decimalValue >>> 0).toString(2);
        result = result.slice(-bitLength);
      } else {
        result = decimalValue.toString(2).padStart(bitLength, '0');
      }
      result = result.match(/.{4}/g)?.join(' ') || result;
    } else {
      resultInput.value = 'Error';
      return;
    }
    resultInput.value = result;

    copyButton.addEventListener('click', () => {
      navigator.clipboard
        .writeText(resultInput.value)
        .then(() => {
          console.log('Texto copiado al portapapeles');
        })
        .catch((err) => {
          console.log('Error al copiar el texto: ', err);
        });
    });
  }

  setupDropdown('fromConvertInput', 'fromOptions', 'dec', 'Decimal');
  setupDropdown('toConvertInput', 'toOptions', 'bin', 'Binary');

  document
    .getElementById('numberToconvertInput')
    ?.addEventListener('input', convertNumber);

  document
    .getElementById('numberToconvertInput')
    ?.addEventListener('keydown', (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        const target = event.target as HTMLInputElement;
        target.value = '';
        const resultInput = document.getElementById(
          'resultConvertInput'
        ) as HTMLInputElement;
        if (resultInput) {
          resultInput.value = '';
        }
      }
    });

  document.getElementById('SwapConvertBtn')?.addEventListener('click', () => {
    const fromInput = document.getElementById(
      'fromConvertInput'
    ) as HTMLInputElement;
    const toInput = document.getElementById(
      'toConvertInput'
    ) as HTMLInputElement;
    if (!fromInput || !toInput) {
      return;
    }
    [fromInput.value, toInput.value] = [toInput.value, fromInput.value];
    [fromInput.dataset.value, toInput.dataset.value] = [
      toInput.dataset.value || '',
      fromInput.dataset.value || ''
    ];
    convertNumber();
  });
}


// Función para agrupar la cadena binaria en bloques de 4 desde la derecha
function groupBinary(numStr: string): string {
  let groups: string[] = [];
  let i = numStr.length;
  while (i > 0) {
    const start = Math.max(0, i - 4);
    groups.unshift(numStr.substring(start, i));
    i -= 4;
  }
  return groups.join(' ');
}
