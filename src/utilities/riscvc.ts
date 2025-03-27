import { parse } from './riscv';

export type InternalRepresentation = {
  instructions: Array<any>;
  symbols: Array<any>;
};

export type ParserResult = {
  success: boolean;
  ir: InternalRepresentation | undefined;
  info: string;
  extra: any | undefined;
};

export function compile(inputSrc: string, inputName: string): ParserResult {
  console.log('First pass!.');
  let labelTable = {};
  try {
    parse(inputSrc, {
      grammarSource: inputName,
      symbols: labelTable,
      firstPass: true
    });
  } catch (obj) {
    //console.error('First pass: assembler error: ', obj);
    return {
      success: false,
      ir: undefined,
      info: 'First pass failure',
      extra: obj
    };
  }
  console.log('Second pass!.');
  let parserOutput;
  try {
    parserOutput = parse(inputSrc, {
      grammarSource: inputName,
      symbols: labelTable,
      firstPass: false
    });
  } catch (obj) {
    //console.error('Assembler error: ', obj);
    return {
      success: false,
      ir: undefined,
      info: 'Second pass failure',
      extra: obj
    };
  }
  console.log('Success!.');
  const result = {
    success: true,
    ir: { instructions: parserOutput as any[], symbols: labelTable as any[] },
    info: 'Success',
    extra: undefined
  };
  return result;
}
