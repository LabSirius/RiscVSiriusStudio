import { logger } from "../utilities/logger";

export class RegistersFile {
  private registers: Array<string>;
  public constructor() {
    this.registers = new Array(32).fill("00000000000000000000000000000000");
  }

  public printRegisters() {
    this.registers.forEach((val, idx) => {
      logger().info({ msg: "PrintRegister", idx: "x" + idx, val: val });
    });
  }

  private getIndexFromName(name: string): number {
    return parseInt(name.substring(1));
  }
  public readRegisterFromName(name: string): string {
    const value = this.registers[this.getIndexFromName(name)];
    if (value === undefined) {
      throw new Error(`Register ${name} not found`);
    }
    return value;
  }

  public readRegister(index: number): string {
    const value = this.registers[index];
    if (value === undefined) {
      throw new Error(`Register index ${index} not found`);
    }
    return value;
  }

  public writeRegister(name: string, value: string) {
    const idx = this.getIndexFromName(name);
    if (idx === 0) {
      return;
    }
    this.registers[idx] = value;
  }

  public getRegisterData() {
    return this.registers;
  }
}

export class DataMemory {
  private memory: Array<string>;
  public getMemory(): Array<string> {
    return [...this.memory];
  }
  
  private codeAreaEnd: number;
  get codeSize() {
    return this.codeAreaEnd + 1;
  }

  private size: number;
  get memSize() {
    return this.size;
  }
  get spInitialAddress() {
    return this.size - 4;
  }

  private _constantsSize: number;
  get constantsSize() : number {
    return this._constantsSize;
  }

  public constructor(programSize : number, codeSize: number, size: number) {
    this.codeAreaEnd = codeSize - 1;
    this._constantsSize =  codeSize - programSize;
    this.size = 0;
    this.memory = [];
    this.resize(size);
  }

  public resize(size: number) {
    this.size = size;
    const totalSize = this.codeSize + this.memSize;
    this.size = totalSize;
    this.memory = new Array(totalSize).fill("00000000");
  }

  public uploadProgram(memory: Array<any>) {
      memory.forEach((mem) => {
        const address = mem.memdef;
        this.memory[address] = mem.binValue;
      });
  }
  
  public lastAddress() {
    return this.size - 1;
  }

  public validAddress(address: number) {
    return this.canWrite(1, address);
  }

  public canWrite(numBytes: number, address: number) {
    const lastAddress = address + numBytes - 1;
    return lastAddress <= this.lastAddress();
  }

  public write(data: Array<string>, address: number) {
    const lastAddress = address + data.length - 1;
    if (lastAddress > this.lastAddress()) {
      throw new Error("Data memory size exceeded.");
    }
    for (let i = 0; i < data.length; i++) {
      if (data[i] === undefined) {
        throw new Error("Undefined data element");
      }
      this.memory[address + i] = data[i]!;
    }
  }
  public read(address: number, length: number): Array<string> {
    const lastAddress = address + length - 1;
    if (lastAddress > this.lastAddress()) {
      throw new Error("Data memory size exceeded.");
    }
    let data = [] as Array<string>;
    for (let i = 0; i < length; i++) {
      const value = this.memory[address + i];
      if (value !== undefined) {
        data.push(value);
      } else {
        throw new Error(`Invalid memory access at ${address + i}`);
      }
    }
    return data.reverse();
  }
}