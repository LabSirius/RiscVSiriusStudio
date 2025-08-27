import { parse } from './riscv';
import { binaryToHex, hexToBin } from './conversions';

type Align = {
  start: number,
  end: number
};

type MemoryValues = {
  binValue: string,
  hexValue: string
};

type Data = {
  memdef: number,
  value: string | string[],
  typeAlign: string,
  align: Align
};

type Constant = {
  name: string,
  value: number
};

type Memory =  MemoryValues & {
  memdef: number,
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
  return addr + endAligment(addr, alignment);
}

function endAligment(addr: number, alignment: number): number {
  return alignment - addr % alignment;
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

function needFillMemory(memdef: number, before: number): boolean {
  if (before+ 1 < memdef){
    return true;
  }
  return false;
}

function constructFilledMemory(start: number, end: number): Memory[] {

  let filled: Memory[] = [];
  filled = Array.from({length: end - start}, (_, i) => {
    return {
      memdef: start + i,
      binValue: "XX",
      hexValue: "XX"
    };
  }
  );
return filled;

}

function getHValuesToMemory(binencodig: string): MemoryValues {
  return {
    binValue: binencodig,
    hexValue: binaryToHex(binencodig)
  };
}

function getBValuesToMemory(hex: string): MemoryValues {
  return {
    binValue: hexToBin(hex),
    hexValue: hex
  };
}

function constructMemoryFromAsciiList(asciiList: string[], memdef: number): Memory[] {
  let mem: Memory[] = [];
  for (let i = 0; i < asciiList.length; i++){
    const char = asciiList[i];
    if (char !== undefined) {
      mem.push({
        memdef: memdef + i + 1,
        ...getBValuesToMemory(char)
      });
    }
  }

  return mem;
}

function fillMemory(data: Data, before: number | undefined, memory: Memory[]): [number, Memory[]] | [undefined, Memory[]] {
  if (before && needFillMemory(data.align.start, before)){
    memory = memory.concat(constructFilledMemory(before + 1, data.align.start));
  }

  let mem: Memory[] = [];

  if (Array.isArray(data.value)){
    const last = memory[ memory.length - 1];
    if (last !== undefined){
      mem = constructMemoryFromAsciiList(data.value, last.memdef);
    }
  }
  else {
    mem = constructMemoryFromNumber(data.value, data.align.start);
  }
  memory = memory.concat(mem);

  return [memory[ memory.length - 1 ]?.memdef, memory];

}

function getHexList(hexEncoding: string): string[]{
  return hexEncoding.split("-");
}

function getByteList(binEncoding: string): string[] {

  let binList: string[] = [];
  for (let i = 0; i < binEncoding.length; i += 8){
    binList.push(binEncoding.slice(i, i+8));
  }

  return binList;
}

function constructMemoryFromInst(instruction: any): Memory[] {
  const binList = getByteList(instruction.encoding.binEncoding);
  const hexList = getHexList(instruction.encoding.hexEncoding);

  return getMemoryFromList(binList, hexList, instruction.inst);
}

function constructMemoryFromNumber(value: string, start: number): Memory[] {
  const hexList = getHexList(value);
  const binList = getByteList(hexToBin(hexList.join("")));

  return getMemoryFromList(binList, hexList, start);
}
function getMemoryFromList(binList: string[], hexList: string[], start: number): Memory[]{
  let mem: Memory[] = [];
  for (let i = 0; i < binList.length; i++){
    const index = binList.length - i - 1;
    mem.push({
      memdef: start + i,
      binValue: binList[index]!,
      hexValue: hexList[index]!
    });
  }

  return mem;  
}

function constructMemory(instructions: any[], data: Record<string, Data>): Memory[] {
  let memory: Memory[] = [];
  instructions.forEach((element) => 
    memory = memory.concat(constructMemoryFromInst(element))
  );

  let before: number | undefined = memory[ memory.length -1 ]?.memdef;

  Object.keys(data).forEach((key) => [before, memory] = fillMemory(data[key]!, before, memory));
  return memory;
}

function reorderMemory(memory: Memory[]): Memory[]{
  let mem: Memory[] = [];
  for (let i = 0; i < memory.length; i += 4) {
      const block = memory.slice(i, i + 4).reverse();
      mem = mem.concat(block);
    }

  return mem;
}

function fillEndMemory(memory: Memory[]): Memory[] {
  
  const lastValue = memory.at(-1);
  const start = lastValue?.memdef! + 1;
  const end = alignAddress(start, 4);

  const mem = constructFilledMemory(start, end);

  memory = memory.concat(mem);

  return memory;
}

export type InternalRepresentation = {
  instructions: Array<any>;
  symbols: Array<any>;
  memory: Memory[],
  directives: Record<string, any[]>,
  dataTable: Record<string, Data>,
  constants: Constant[]
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
    retError.extra = obj;
    return retError;
  }

  let memory = constructMemory(parserOutput, dataTable);
  memory = fillEndMemory(memory);
  memory = reorderMemory(memory);

  const result = {
    success: true,
    ir: { instructions: parserOutput as any[], 
      symbols: labelTable as any[],
      constants: constantTable,
      directives: directives,
      dataTable: dataTable,
      options: options,
      memory: memory
      
    },
    info: 'Success',
    extra: undefined
  };
  return result;
}