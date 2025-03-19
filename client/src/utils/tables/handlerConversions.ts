/**
 * Converts the binary representation of a number to an unsigned decimal.
 * @param binary number representation
 * @returns unsigned decimal representation
 */
export function binaryToUInt(binary: string): string {
  return parseInt(binary, 2).toString();
}

/**
 * Converts the binary representation of a number to a signed decimal.
 * @param binary number representation
 * @returns signed decimal representation
 */
export function binaryToInt(binary: string): string {
  return (~~parseInt(binary, 2)).toString();
}

export function intToBinary(sgnInteger: number): string {
  const result = (sgnInteger >>> 0).toString(2);
  if (sgnInteger < 0) {
    return result.padStart(32, '1');
  } else {
    return result.padStart(32, '0');
  }
}

export function intToHex(sgnInteger: number): string {
  return binaryToHex(intToBinary(sgnInteger));
}

/**
 * Converts the binary representation of a number to an hexadecimal
 * representation.
 * @param binary number representation
 * @returns hexadecimal representation
 */
export function binaryToHex(binary: string): string {
  return parseInt(binary, 2).toString(16);
}

/**
 * Converts the binary representation to an ascii sequence.
 * @param binary representation
 * @returns ascii representation
 */
export function binaryToAscii(binary: string): string {
  const wordCodes = binary.match(/.{1,8}/g);
  if (!wordCodes) {
    return 'fix me!!';
  }
  const word = wordCodes.map((code) => {
    const asc = parseInt(code, 2);
    return String.fromCharCode(asc);
  });

  return word.join('');
}

/**
 * Checks if an unsigned integer is valid
 * @param input decimal representation
 * @returns whther input is a valid unsigned integer that fits in 32 bits.
 */
export function validUInt32(input: string): boolean {
  const unsigned = /^\d+$/g;
  const max32unsigned = 4294967295;

  const asInt = parseInt(input);
  return asInt <= max32unsigned && unsigned.test(input);
}

/**
 * Checks if a binary is valid
 * @param input binary representation
 * @returns whether input is a valid 32 bits binary.
 */
export function validBinary(input: string): boolean {
  const binary = /^[01]+$/g;
  return input.length <= 32 && binary.test(input);
}

/**
 * Checks if a signed integer is valid
 * @param input possibly signed decimal representation
 * @returns whether input is a valid signed integer that fits in 32 bits.
 */
export function validInt32(input: string): boolean {
  const signed = /^[-+]?\d+$/g;
  const max32signed = 2147483647;
  const min32signed = -2147483648;

  const asInt = parseInt(input);
  return asInt >= min32signed && asInt <= max32signed && signed.test(input);
}

/**
 * Checks if a hexadecimal value is valid
 * @param input hexadecimal representation
 * @returns whether input is a valid hexadecimal that fits in 32 bits.
 */
export function validHex(input: string): boolean {
  const hex = /^[A-Fa-f0-9]{1,8}$/g;
  return hex.test(input);
}

/**
 * Checks if a string value is valid
 * @param input string representation
 * @returns whther input is a valid string that fits in 32 bits.
 */
export function validAscii(input: string): boolean {
  return input.length <= 4;
}

/**
 * Computes the representation of a binary value in the view. This is used to
 * short the way binary numbers are presented to the user. I (Gustavo) chose a
 * verilog style representation but it has to be discussed.
 * @param value to represent
 * @returns
 */
export function binaryRepresentation(value: string) {
  const out = extractBinGroups(value);
  let repr = "32'b";
  if (out) {
    if (out.y?.length === 0) {
      repr = repr + '0';
    } else {
      repr = repr + out.y;
    }
  }
  return repr;
}
/**
 * Splits a binary number in two parts:
 *
 * y: the meaningful part of the number
 * x: the meaningless part which consists of all zeroes.
 * @param str a binary number representation
 * @returns {x: val, y: val}
 */
function extractBinGroups(str: string) {
  const regex = /^(?<x>0*)(?<y>1*[01]*)$/;
  const match = str.match(regex);
  if (match) {
    return {
      x: match.groups?.x,
      y: match.groups?.y
    };
  }
  return null;
}

/**
 * Translates user input depending on the specific type into a string of bits.
 * @param value as the user typed in the input box
 * @param vtype type selected when the user edited the cell
 * @returns value as a binary string
 */
export function toBinary(value: string, vtype: RegisterView) {
  switch (vtype) {
    case 2:
      return value;
    case 'unsigned':
      return parseInt(value).toString(2);
    case 'signed': {
      const num = parseInt(value);
      return (num >>> 0).toString(2);
    }
    case 16: {
      const num = parseInt(value, 16);
      return num.toString(2);
    }
    case 'ascii': {
      const array = Array.from(value);
      const result = array.reduce((acc, char) => {
        const charAscii = char.charCodeAt(0);
        const charBin = charAscii.toString(2).padStart(8, '0');
        return acc + charBin;
      }, '');
      return result;
    }
  }
  return '';
}

type RegisterView = 2 | 'signed' | 'unsigned' | 16 | 'ascii';

