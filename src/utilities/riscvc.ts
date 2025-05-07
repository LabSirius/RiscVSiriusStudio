import { parse } from './riscv';

type Align = {
  start: number,
  end: number
};

type Data = {
  memdef: number,
  value: number | number[],
  typeAlign: string,
  align: Align
};

type Constant = {
  name: string,
  value: number
};

let labelTable = {};
let constantTable: Constant[] = [];
let directives = {};
let dataTable: Record<string, Data> = {};
let counters = {
  instcounter: 0,
  instCountData: 0
};

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

function resolveAlignString(ascii: number[]): number {
  const len = ascii.length;
  return len;
}

function setInstCountData(end: number): void {
  counters.instCountData += end; 
}

function alignAddress(addr: number, alignment: number): number {
  if (addr % alignment === 0){
      return addr;
  }
  return addr + (alignment - addr % alignment);
}

function resolveAlign(align: string, value: any): Align {
  let end: number = 0;
  let start = counters.instCountData;
  let sum;
  switch (align) {
    case ".word":
      start = alignAddress(start, 4);
      end = (start + 3);
      setInstCountData(4);
      break;

    case ".string":
      sum = resolveAlignString(value);
      end = start + sum - 1;
      setInstCountData(sum);
      break;

    case ".asciz":
      sum = resolveAlignString(value);
      end = start + sum - 1;
      setInstCountData(sum);
      break;

    case ".half":
      start = alignAddress(start, 2);
      end = start + 1;
      setInstCountData(3);
      break;
    
    case ".2byte":
      end = start + 1;
      setInstCountData(3);
      break;
    
    case ".4byte":
      end = start + 3;
      setInstCountData(4);
      break;
    
    case ".byte":
      end = start + 1;
      setInstCountData(2);
      break;

    default:
      break;
  }

  return  {
        start: start,
        end: end
      };
}

function setValueData(name: string): void {
  const data = dataTable[name];
  if (!data) {
    throw new Error(`No existe data para la clave "${name}"`);
  }
  const valueAlign = resolveAlign(data.typeAlign, data["value"]);
  data["align"] = valueAlign;
  data["memdef"] = valueAlign.start;
}

function updateMemdefData(): void {
  Object.keys(dataTable).forEach( (element) => {
    setValueData(element);
  });
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
  dataTable = {};
  constantTable = [];
  labelTable = {};
  counters = {
    instcounter: 0,
    instCountData: 0
  };
  directives = {};
  
  console.log('First pass!.');
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
  updateMemdefData();
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
      dataTable: dataTable,
      options: options 
      
    },
    info: 'Success',
    extra: undefined
  };
  console.log(result);
  return result;
}
