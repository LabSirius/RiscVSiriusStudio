import { parse } from './riscv';

function anyCommonElement<T>(...arrays: T[][]): [boolean, any] {
  const visited = new Set<T>();

  for (const array of arrays) {
    const actualy = new Set<T>();
    for (const item of array) {
      if (visited.has(item)) {
        return [true, item];
      }
      actualy.add(item);
    }
    for (const item of actualy) {
      visited.add(item);
    }
  }

  return [false, undefined];

  // return arr1.some((element) => arr2.includes(element));
}

function needTextSection(directives: string[]): [boolean, any] {
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
  let dataTable = {};
  let counters = {
    instcounter: 0,
    instCountData: 0
  };
  let options = {
    pc: 0
  };

  const retError: ParserResult = {
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
      dataTable: dataTable,
      counters: counters,
      options: options,
      firstPass: true
    });
  } catch (obj) {
    //console.error('First pass: assembler error: ', obj);
    retError.extra = obj;
    return retError;
  }

  const [needText, element] = needTextSection(Object.keys(directives));
  if (needText){
    if (!checkTextSection(directives)){
      console.error(`.text directive required because ${element} directive was found, but .text was not`);
      retError.extra = `.text directive required because ${element} directive was found, but .text was not`;
      return retError;
    }
  }

  const [exCommonElement, commonElement] = anyCommonElement(Object.keys(labelTable), Object.keys(constantTable), Object.keys(dataTable));
  if (exCommonElement){
    console.error(`Duplicate identifier: ${commonElement} found multiple times`);
    retError.extra = `Duplicate identifier: ${commonElement} found multiple times`;
    return retError;
  }
  counters.instCountData = counters.instcounter * 4;
  counters.instcounter = 0;
  console.log('Second pass!.');
  let parserOutput;
  try {
    parserOutput = parse(inputSrc, {
      grammarSource: inputName,
      symbols: labelTable,
      constantTable: constantTable,
      directives: directives,
      dataTable: dataTable,
      counters: counters,
      options: options,
      firstPass: false
    });
  } catch (obj) {
    //console.error('Assembler error: ', obj);
    retError.extra = obj;
    return retError;
  }
  console.log('Success!.');
  const result = {
    success: true,
    ir: { instructions: parserOutput as any[], 
          symbols: labelTable as any[],
          constants: constantTable as any[],
          directives: directives as any[],
          dataTable: dataTable as any[],
          options: options 

        },
    info: 'Success',
    extra: undefined
  };
  return result;
}
