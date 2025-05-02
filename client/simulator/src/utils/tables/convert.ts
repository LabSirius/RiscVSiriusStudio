// Cleans and formats the input for Two's Complement conversion.
// Removes non-binary characters, limits to 32 digits, pads with '0' or '1' and groups into sets of 4.
export function processTwoComplementInput(inputValue: string, isNegative: boolean): string {
    const padChar = isNegative ? '1' : '0';
    let cleanValue = inputValue.replace(/[^01]/g, ''); // Remove non-binary characters
    cleanValue = cleanValue.slice(-32); // Take the last 32 characters
    cleanValue = cleanValue.padStart(32, padChar); // Pad to 32 digits
    return cleanValue.replace(/(.{4})(?=.)/g, '$1 '); // Group into 4-digit blocks
  }
  
  // Converts a value from one format to another.
  export function convertValue(value: string, from: string, to: string, isNegative: boolean): string {
    // Handle ASCII conversion separately
    if (from === 'ascii') {
      if (to === 'dec') {
        let res = "";
        for (let i = 0; i < value.length; i++) {
          res += value.charCodeAt(i).toString(10) + " ";
        }
        return res.trim();
      } else if (to === 'hex') {
        let res = "";
        for (let i = 0; i < value.length; i++) {
          res += value.charCodeAt(i).toString(16).toUpperCase().padStart(2, "0") + " ";
        }
        return res.trim();
      } else if (to === 'ascii') {
        return value;
      }
    }
  
    // Remove spaces from the input value
    const rawValue = value.replace(/ /g, '');
    let decimalValue: number;
  
    try {
      if (from === 'hex') {
        decimalValue = parseInt(rawValue, 16);
      } else if (from === 'dec') {
        decimalValue = parseInt(rawValue, 10);
      } else if (from === 'twoCompl') {
        const padChar = isNegative ? '1' : '0';
        const bits = rawValue.padStart(32, padChar);
        decimalValue = parseInt(bits, 2);
        if (bits[0] === '1') {
          decimalValue -= 0x100000000;
        }
      } else {
        throw new Error('Invalid format');
      }
      if (isNaN(decimalValue)) {
        throw new Error('Invalid value');
      }
    } catch {
      return '';
    }
  
    if (to === 'hex') {
      if (from === 'dec' && decimalValue < 0) {
        const twosComplement = ((0x10000 + (decimalValue % 0x10000)) & 0xFFFF);
        return twosComplement.toString(16).toUpperCase().padStart(4, '0');
      }
      return decimalValue.toString(16).toUpperCase();
    } else if (to === 'dec') {
      if (from === 'hex') {
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
        return signedValue.toString(10) === unsignedValue.toString(10)
          ? signedValue.toString(10)
          : signedValue.toString(10) + " / " + unsignedValue.toString(10);
      }
      return decimalValue.toString(10);
    } else if (to === 'twoCompl') {
      const binary = (decimalValue >>> 0).toString(2).padStart(32, '0');
      return binary.replace(/(.{4})(?=.)/g, '$1 ');
    } else if (to === 'ascii') {
      const valueNum = decimalValue >>> 0;
      const bytes = [
        (valueNum >> 24) & 0xFF,
        (valueNum >> 16) & 0xFF,
        (valueNum >> 8) & 0xFF,
        valueNum & 0xFF,
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
      return asciiStr;
    }
  
    return '';
  }
  