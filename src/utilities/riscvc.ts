import { parse } from './riscv';

function needTextSection(directives: string[]): boolean {
  return [".data", ".rodata", ".bss"].some((element) => directives.includes(element));
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
      return {
        success: false,
        ir: undefined,
        info: 'First pass failure',
        extra: undefined
      };
    }
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
