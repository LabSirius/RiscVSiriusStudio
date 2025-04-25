import { parse } from './riscv';

function anyCommonElement(arr1: any[], arr2: any[]): boolean {
  return arr1.some((element) => arr2.includes(element));
}

function needTextSection(directives: string[]): boolean {
  return anyCommonElement([".data", ".rodata", ".bss"], directives);
}

function checkTextSection(directives: {}): boolean {
  return ".text" in directives;
}

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
  let constantTable = {};
  let directives = {};

  const retError = {
    success: false,
    ir: undefined,
    info: 'First pass failure',
    extra: undefined
  };

  try {
    parse(inputSrc, {
      grammarSource: inputName,
      symbols: labelTable,
      constantTable: constantTable,
      directives: directives,
      firstPass: true
    });
  } catch (obj) {
    console.error('First pass: assembler error: ', obj);
    return {
      success: false,
      ir: undefined,
      info: 'First pass failure',
      extra: obj
    };
  }

  if (needTextSection(Object.keys(directives))){
    if (!checkTextSection(directives)){
      console.error("Need .text directive, but not found");
      return retError;
    }
  }

  if (anyCommonElement(Object.keys(labelTable), Object.keys(constantTable))){
    console.error("Identifier names must be unique");
    return retError;
  }

  console.log('Second pass!.');
  let parserOutput;
  try {
    parserOutput = parse(inputSrc, {
      grammarSource: inputName,
      symbols: labelTable,
      constantTable: constantTable,
      directives: directives,
      firstPass: false
    });
  } catch (obj) {
    console.error('Assembler error: ', obj);
    return retError;
  }
  console.log('Success!.');
  const result = {
    success: true,
    ir: { instructions: parserOutput as any[], 
          symbols: labelTable as any[],
          constants: constantTable as any[],
          directives: directives as any[] 
        },
    info: 'Success',
    extra: undefined
  };
  return result;
}
