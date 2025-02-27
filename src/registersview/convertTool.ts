class Converter {

  private checkContainer = document.getElementById('checkIsNegativeContainer') as HTMLDivElement;
  private isNegativeCheck = document.getElementById('isNegative') as HTMLInputElement;
  private numberInput = document.getElementById('numberToconvertInput') as HTMLInputElement;
  private fromInput = document.getElementById('fromConvertInput') as HTMLInputElement;
  private toInput = document.getElementById('toConvertInput') as HTMLInputElement;
  private resultInput = document.getElementById('resultConvertInput') as HTMLInputElement;

  constructor() {

    this.setupDropdown('fromConvertInput', 'fromOptions', 'dec', 'Decimal');
    this.setupDropdown('toConvertInput', 'toOptions', 'hex', 'Hexadecimal');

    this.checkContainer.classList.add('hidden');

    document.addEventListener('click', this.handleInputClick);
    this.numberInput.addEventListener('input', () => {
      if (this.fromInput.dataset.value === 'twoCompl') {
        const currentValue = this.numberInput.value;
        const cleaned = currentValue.replace(/ /g, '');
        const padChar = this.isNegativeCheck.checked ? '1' : '0';
        const newValue = cleaned.slice(-32).padStart(32, padChar).replace(/(.{4})(?=.)/g, '$1 ');
        if (currentValue !== newValue) {
          this.numberInput.value = newValue;
        }
        this.convertNumber();
      } else {
        setTimeout(() => this.convertNumber(), 0);
      }
    });

    document.getElementById('SwapConvertBtn')?.addEventListener('click', () => {
      [this.fromInput.value, this.toInput.value] = [this.toInput.value, this.fromInput.value];
      [this.fromInput.dataset.value, this.toInput.dataset.value] = [this.toInput.dataset.value!, this.fromInput.dataset.value!];
      this.checkContainer.classList.toggle('hidden', this.fromInput.dataset.value !== 'twoCompl');
      this.numberInput.value = '';
      this.resultInput.value = '';

      if (this.fromInput.dataset.value === 'twoCompl') {
        if (this.isNegativeCheck.checked) {
          this.numberInput.value = '1111 1111 1111 1111 1111 1111 1111 1111';
        } else {
          this.numberInput.value = '0000 0000 0000 0000 0000 0000 0000 0000';
        }
        this.convertNumber();
      }
      this.convertNumber();
    });

    this.isNegativeCheck.addEventListener('change', () => {
      if (this.fromInput.dataset.value === 'twoCompl') {
        if (this.isNegativeCheck.checked) {
          this.numberInput.value = '1111 1111 1111 1111 1111 1111 1111 1111';
        } else {
          this.numberInput.value = '0000 0000 0000 0000 0000 0000 0000 0000';
        }
        this.convertNumber();
      }
    });
  }

  private setupDropdown(
    inputId: string,
    optionsId: string,
    defaultValue: string,
    defaultText: string
  ): void {
    const inputElement = document.getElementById(inputId) as HTMLInputElement;
    const optionsElement = document.getElementById(optionsId) as HTMLDivElement;
    inputElement.value = defaultText;
    inputElement.dataset.value = defaultValue;
    inputElement.addEventListener('click', () => {
      optionsElement.classList.toggle('hidden');
    });
    optionsElement.querySelectorAll<HTMLParagraphElement>('.option-convert').forEach((option) => {
      option.addEventListener('click', (event) => {
        const target = event.target as HTMLParagraphElement;
        inputElement.value = target.innerText;
        inputElement.dataset.value = target.dataset.value || '';
        optionsElement.classList.add('hidden');
        if (inputId === 'fromConvertInput') {
          if (target.dataset.value === 'twoCompl') {
            this.checkContainer.classList.remove('display-none');
            this.isNegativeCheck.checked = false;
            this.numberInput.value = '0000 0000 0000 0000 0000 0000 0000 0000';
          } else {
            this.checkContainer.classList.add('display-none');
            this.isNegativeCheck.checked = false;
            this.numberInput.value = '';
          }
        }
        this.convertNumber();
      });
    });
    document.addEventListener('click', (event) => {
      if (!inputElement.contains(event.target as Node) && !optionsElement.contains(event.target as Node)) {
        optionsElement.classList.add('hidden');
      }
    });
  }

  private processTwoComplementInput(inputValue: string): string {
    let cleanValue = inputValue.replace(/[^01]/g, '');
    const padChar = this.isNegativeCheck.checked ? '1' : '0';
    cleanValue = cleanValue.slice(-32);
    cleanValue = cleanValue.padStart(32, padChar);
    return cleanValue.replace(/(.{4})(?=.)/g, '$1 ');
  }

  private handleInputClick(event: MouseEvent) {
    const input = event.target as HTMLInputElement;
    if (input.id === 'numberToconvertInput') {
      requestAnimationFrame(() => {
        input.setSelectionRange(input.value.length, input.value.length);
      });
    }
  }
  private convertNumber(): void {
    const fromBase = this.fromInput.dataset.value as string;
    const toBase = this.toInput.dataset.value as string;
    this.checkContainer.classList.toggle('hidden', fromBase !== 'twoCompl');

    if (fromBase === 'twoCompl') {
      const processed = this.processTwoComplementInput(this.numberInput.value);
      if (this.numberInput.value !== processed) {
        this.numberInput.value = processed;
      }
    } else if (fromBase !== 'ascii') {
      this.numberInput.value = this.numberInput.value.replace(/ /g, '');
    }

    if (fromBase === 'ascii') {
      if (toBase === 'dec') {
        let res = "";
        for (let i = 0; i < this.numberInput.value.length; i++) {
          let code = this.numberInput.value.charCodeAt(i);
          res += code.toString(10) + " ";
        }
        this.resultInput.value = res.trim();
        return;
      } else if (toBase === 'hex') {
        let res = "";
        for (let i = 0; i < this.numberInput.value.length; i++) {
          let code = this.numberInput.value.charCodeAt(i);
          res += code.toString(16).toUpperCase().padStart(2, "0") + " ";
        }
        this.resultInput.value = res.trim();
        return;
      } else if (toBase === 'ascii') {
        this.resultInput.value = this.numberInput.value;
        return;
      }
    }

    const rawValue = this.numberInput.value.replace(/ /g, '');
    let decimalValue: number;
    try {
      if (fromBase === 'hex') {
        decimalValue = parseInt(rawValue, 16);
      } else if (fromBase === 'dec') {
        decimalValue = parseInt(rawValue, 10);
      } else if (fromBase === 'twoCompl') {
        const padChar = this.isNegativeCheck.checked ? '1' : '0';
        const bits = rawValue.padStart(32, padChar);
        decimalValue = parseInt(bits, 2);
        if (bits[0] === '1') {
          decimalValue -= 0x100000000;
        }
      } else if (fromBase === 'ascii') {
        const inputStr = rawValue.slice(-4);
        decimalValue = 0;
        for (let i = 0; i < inputStr.length; i++) {
          const charCode = inputStr.charCodeAt(i);
          if (charCode > 255) {
            throw new Error('Carácter no ASCII');
          }
          decimalValue = (decimalValue << 8) + charCode;
        }
        decimalValue = decimalValue >>> 0;
      } else {
        throw new Error('Formato inválido');
      }
      if (isNaN(decimalValue)) {
        throw new Error('Valor inválido');
      }
    } catch {
      this.resultInput.value = '';
      return;
    }

    if (toBase === 'hex') {
      if (fromBase === 'dec' && decimalValue < 0) {
        const twosComplement = ((0x10000 + (decimalValue % 0x10000)) & 0xFFFF);
        this.resultInput.value = twosComplement.toString(16).toUpperCase().padStart(4, '0');
      } else {
        this.resultInput.value = decimalValue.toString(16).toUpperCase();
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
        if (signedValue.toString(10) === unsignedValue.toString(10)) {
          this.resultInput.value = signedValue.toString(10);
        } else {
          this.resultInput.value = signedValue.toString(10) + " / " + unsignedValue.toString(10);
        }
      } else {
        this.resultInput.value = decimalValue.toString(10);
      }
    } else if (toBase === 'twoCompl') {
      let binary = (decimalValue >>> 0).toString(2).padStart(32, '0');
      this.resultInput.value = binary.replace(/(.{4})(?=.)/g, '$1 ');
    } else if (toBase === 'ascii') {
      const value = decimalValue >>> 0;
      const bytes = [
        (value >> 24) & 0xFF,
        (value >> 16) & 0xFF,
        (value >> 8) & 0xFF,
        value & 0xFF
      ];
      let asciiStr = '';
      let started = false;
      for (const byte of bytes) {
        if (byte !== 0 || started) {
          started = true;
          asciiStr += String.fromCharCode(byte);
        }
      }
      if (asciiStr === '' && bytes.length > 0) {
        asciiStr = String.fromCharCode(bytes[bytes.length - 1]);
      }
      this.resultInput.value = asciiStr;
    }
  }
}

export function setUpConvert() {
  new Converter();
}
