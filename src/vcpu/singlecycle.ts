/* eslint-disable @typescript-eslint/naming-convention */

/**
 * A CPU instance consists of:
 * - A program memory
 * - An instruction counter
 * - A register file
 * - A data memory
 *
 * There is an execute instruction function that computes all the values of
 * every component in the simulation.
 */

import {
  getRs1,
  getRs2,
  getRd,
  writesDM,
  writesRU,
  getFunct3,
  getFunct7,
  isIArithmetic,
  isILoad,
  isIJump,
  isAUIPC,
} from "../utilities/instructions";
import { ALU32 } from "./alu32";
import { binaryToInt, intToBinary } from "../utilities/conversions";
import { logger } from "../utilities/logger";
import chunk from "lodash/chunk";

class RegistersFile {
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

class DataMemory {
  private memory: Array<string>;
  public getMemory(): Array<string> {
    return [...this.memory];
  }
  /**
   * Last address in memory of the code area.
   *
   * Code is always stored in the lowest part of the memory. For this reason,
   * code area size is codeAreaEnd + 1.
   */
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

  public constructor(codeSize: number, size: number) {
    this.codeAreaEnd = codeSize - 1;
    this.size = 0;
    this.memory = [];
    this.resize(size);
  }

  public resize(size: number) {
    this.size = size;
    // Ensure there is always space for the code area
    const totalSize = this.codeSize + this.memSize;
    this.size = totalSize;
    this.memory = new Array(totalSize).fill("00000000");
  }

  /**
   * Writes the program into the memory.
   *
   * Assumes memory is big enough to store the program.
   *
   * @param program intermediate representation of the program
   */
  public uploadProgram(program: Array<any>) {
    program.forEach((instruction, index) => {
      const encodingString = instruction.encoding.binEncoding;
      const words = chunk(encodingString.split(""), 8).map((group) => group.join(""));

      words.reverse();
      words.forEach((w, i) => {
        const address = index * 4 + i;
        this.memory[address] = w;
      });
    });
    console.table(this.memory);
    console.log(`Program uploaded. initial sp ${this.spInitialAddress} `);
  }

  public lastAddress() {
    return this.size - 1;
  }

  public validAddress(address: number) {
    return this.canWrite(1, address);
  }

  /**
   * Tests whether @argument numBytes bytes can be written at @argument address
   * without overflowing the memory.
   */
  public canWrite(numBytes: number, address: number) {
    const lastAddress = address + numBytes - 1;
    console.log("last address", lastAddress, "size", this.size);
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

/**
 * The result of a instruction execution is a set of values for each input
 * output and signal of the emulator. Each component then has its own type that
 * describes the computed value it needs to present to the user.
 */

type ALUResult = {
  a: string; // A input to the ALU
  b: string; // B input to the ALU
  operation: string; // Operation performed
  result: string; // Computed result
};

const defaultALUResult = {
  a: "".padStart(32, "0"),
  b: "".padStart(32, "0"),
  result: "".padStart(32, "0"),
  operation: "".padStart(4, "0"),
};

type ADD4Result = {
  result: string; // Computed result
};

const defaultADD4Result = {
  result: "".padStart(32, "0"),
};

type MuxResult = {
  signal: string; // MUX signal
  result: string; // result
};

const defaultMuxResult = {
  signal: "X",
  result: "".padStart(32, "0"),
};

type BUResult = {
  a: string; // Upper value
  b: string; // Lower value
  operation: string; // Operation signal
  result: string; // Computed result
};

const defaultBUResult = {
  a: "".padStart(32, "0"),
  b: "".padStart(32, "0"),
  operation: "".padStart(5, "X"),
  result: "X",
};

type IMMResult = {
  signal: string; // Immediate control signal
  output: string; // Immediate output
};

const defaultIMMResult = {
  signal: "".padStart(3, "X"),
  output: "".padStart(32, "0"),
};

type DMResult = {
  address: string; // read or write address
  dataWr: string; // write data
  dataRd: string; // read data
  writeSignal: string;
  controlSignal: string;
};

const defaultDMResult = {
  address: "".padStart(32, "0"),
  dataWr: "".padStart(32, "0"),
  dataRd: "".padStart(32, "0"),
  writeSignal: "X",
  controlSignal: "".padStart(3, "XXX"),
};

type RUResult = {
  rs1: string;
  rs2: string;
  dataWrite: string;
  writeSignal: string;
};

const defaultRUResult = {
  rs1: "".padStart(32, "0"),
  rs2: "".padStart(32, "0"),
  dataWrite: "".padStart(32, "0"),
  writeSignal: "X",
};

export type SCCPUResult = {
  add4: ADD4Result;
  ru: RUResult;
  imm: IMMResult;
  alua: MuxResult;
  alub: MuxResult;
  alu: ALUResult;
  bu: BUResult;
  dm: DMResult;
  buMux: MuxResult;
  wb: MuxResult;
};

const defaultSCCPUResult = {
  add4: defaultADD4Result,
  ru: defaultRUResult,
  imm: defaultIMMResult,
  alua: defaultMuxResult,
  alub: defaultMuxResult,
  alu: defaultALUResult,
  bu: defaultBUResult,
  dm: defaultDMResult,
  buMux: defaultMuxResult,
  wb: defaultMuxResult,
};

export class SCCPU {
  // TODO: We need a proper type for a program representation.
  private readonly _program: any[];
  get program() {
    return this._program;
  }

  private registers: RegistersFile;
  private dataMemory: DataMemory;
  /**
   * This pc indexes the program array. As so, it is not an address.
   */
  private pc: number;
  // TODO: transform into a javascript get
  public getPC() {
    return this.pc;
  }

  public constructor(program: any[], memSize: number) {
    console.log("Program to execute: ", program);
    this._program = program.filter((sc) => {
      return sc.kind === "SrcInstruction";
    });

    this.registers = new RegistersFile();

    this.dataMemory = new DataMemory(program.length * 4, memSize);
    this.dataMemory.uploadProgram(this.program);
    this.pc = 0;
    // Set the initial value of the stack pointer
    const programSize = program.length * 4;
    this.registers.writeRegister("x2", intToBinary(programSize + memSize - 4));
  }

  public currentInstruction() {
    // console.log('called current instruction ', this.program[this.pc]);
    return this.program[this.pc];
  }

  private currentType(): string {
    return this.currentInstruction().type;
  }

  private currentOpcode(): string {
    return this.currentInstruction().opcode;
  }

  public finished(): boolean {
    return this.pc >= this.program.length;
  }

  public nextInstruction() {
    this.pc++;
    console.log("[next] new value of PC is ", this.pc);
  }

  public jumpToInstruction(address: string) {
    this.pc = parseInt(address, 2) / 4;
    console.log("[jump] new value of PC is ", this.pc);
  }

  private toTwosComplement(n: any, len: any) {
    // Taken from: https://stackoverflow.com/questions/73340264/how-to-convert-a-bigint-to-twos-complement-binary-in-javascript
    // `n` must be an integer
    // `len` must be a positive integer greater than bit-length of `n`

    n = BigInt(n);

    len = Number(len);
    if (!Number.isInteger(len)) {
      throw Error("`len` must be an integer");
    }
    if (len <= 0) {
      throw Error("`len` must be greater than zero");
    }

    // If non-negative, a straight conversion works
    if (n >= 0) {
      n = n.toString(2);
      if (n.length >= len) {
        throw Error("out of range");
      }
      return n.padStart(len, "0");
    }

    n = (-n).toString(2); // make positive and convert to bit string

    if (!(n.length < len || n === "1".padEnd(len, "0"))) {
      throw Error("out of range");
    }

    // Start at the LSB and work up. Copy bits up to and including the
    // first 1 bit then invert the remaining
    let invert = false;
    return n
      .split("")
      .reverse()
      .map((bit: any) => {
        if (invert) {
          return bit === "0" ? "1" : "0";
        }
        if (bit === "0") {
          return bit;
        }
        invert = true;
        return bit;
      })
      .reverse()
      .join("")
      .padStart(len, "1");
  }

  private computeALURes(A: string, B: string, ALUOp: string): string {
    const numA = "0b" + A;
    const numB = "0b" + B;
    let result: BigInt = 0n;
    switch (ALUOp) {
      case "0000":
        result = ALU32.addition(numA, numB);
        break;
      case "1000":
        result = ALU32.subtraction(numA, numB);
        break;
      case "0100":
        result = ALU32.xor(numA, numB);
        break;
      case "0110":
        result = ALU32.or(numA, numB);
        break;
      case "0111":
        result = ALU32.and(numA, numB);
        break;
      case "0001":
        result = ALU32.shiftLeft(numA, numB);
        break;
      case "0101":
        result = ALU32.shiftRight(numA, numB);
        break;
      case "1101":
        result = ALU32.shiftRightA(numA, numB);
        break;
      case "0010":
        result = ALU32.lessThan(numA, numB);
        break;
      case "0011":
        result = ALU32.lessThanU(numA, numB);
        break;
      default:
        throw new Error("ALU: unknown operation");
    }
    const result32 = this.toTwosComplement(result, 32);
    return result32;
  }

  /**
   * Computes the result of executing the current instruction.
   *
   * At this point, the result consists of an object with the following fields:
   * !TODO: document when ready
   */
  public executeInstruction(): SCCPUResult {
    // console.log('execute instruction', this.currentInstruction());
    switch (this.currentType()) {
      case "R":
        // console.log('breakpoint execute r');
        return this.executeRInstruction();
      case "I":
        return this.executeIInstruction();
      case "S":
        return this.executeSInstruction();
      case "B":
        return this.executeBInstruction();
      case "U":
        return this.executeUInstruction();
      case "J":
        return this.executeJInstruction();
      default:
        throw new Error("Unknown instruction " + JSON.stringify(this.currentInstruction()));
    }
  }

  private executeRInstruction() {
    const result: SCCPUResult = { ...defaultSCCPUResult };
    const instruction = this.currentInstruction();

    const rs1Val = this.registers.readRegisterFromName(getRs1(instruction));
    const rs2Val = this.registers.readRegisterFromName(getRs2(instruction));
    const aluOp = getFunct7(instruction)[1] + getFunct3(instruction);
    const aluRes = this.computeALURes(rs1Val, rs2Val, aluOp);
    const add4Res = parseInt(this.currentInstruction().inst) + 4;
    this.registers.writeRegister(getRd(instruction), aluRes);

    result.add4.result = add4Res.toString(2);
    result.ru = {
      rs1: rs1Val,
      rs2: rs2Val,
      dataWrite: aluRes,
      writeSignal: "1",
    };
    result.alua = { result: rs1Val, signal: "0" };
    result.alub = { result: rs2Val, signal: "0" };
    result.alu = { a: rs1Val, b: rs2Val, operation: aluOp, result: aluRes };
    result.bu = { ...defaultBUResult, operation: "00XXX", result: "0" };
    result.buMux = { signal: "0", result: add4Res.toString(2) };
    result.wb = { result: aluRes, signal: "00" };
    return result;
  }

  private executeIInstruction(): SCCPUResult {
    const result: SCCPUResult = { ...defaultSCCPUResult };
    const instruction = this.currentInstruction();

    const rs1Val = this.registers.readRegisterFromName(getRs1(instruction));
    const imm12Val = this.currentInstruction().encoding.imm12;
    const imm32Val = imm12Val.padStart(32, imm12Val.at(0));
    const add4Res = parseInt(this.currentInstruction().inst) + 4;

    let aluOp = "";
    switch (true) {
      case isIArithmetic(instruction.type, instruction.opcode):
        aluOp = "0" + getFunct3(instruction);
        break;
      case isILoad(this.currentType(), this.currentOpcode()):
        aluOp = "0000";
        break;
      case isIJump(this.currentType(), this.currentOpcode()):
        aluOp = "0000";
        break;
    }

    const aluRes = this.computeALURes(rs1Val, imm32Val, aluOp);
    this.registers.writeRegister(getRd(instruction), aluRes);
    result.add4.result = add4Res.toString(2);
    result.ru = {
      ...defaultRUResult,
      rs1: rs1Val,
      writeSignal: "1",
    };
    result.alu = { a: rs1Val, b: imm32Val, operation: aluOp, result: aluRes };
    result.imm = { signal: "000", output: imm32Val };
    result.alua = { result: rs1Val, signal: "0" };
    result.alub = { result: imm32Val, signal: "1" };

    switch (true) {
      case isIArithmetic(instruction.type, instruction.opcode):
        // TODO: I have to update the parser to look for shift operations that use shamt and funct7
        result.wb = { signal: "00", result: aluRes };
        result.bu = { ...defaultBUResult, result: "0", operation: "00XXX" };
        result.buMux = { signal: "0", result: add4Res.toString(2) };
        result.ru.dataWrite = aluRes;
        break;
      case isILoad(this.currentType(), this.currentOpcode()):
        const dmCtrl = getFunct3(instruction);
        let value = this.readFromMemory(parseInt(aluRes, 2), parseInt(dmCtrl, 2));
        result.bu = { ...defaultBUResult, result: "0", operation: "00XXX" };
        result.buMux = { signal: "0", result: add4Res.toString(2) };
        result.dm = {
          ...defaultDMResult,
          address: aluRes,
          writeSignal: "0",
          controlSignal: dmCtrl,
          dataRd: value,
        };
        result.wb = { signal: "01", result: value };
        result.ru.dataWrite = value;
        break;
      case isIJump(this.currentType(), this.currentOpcode()):
        result.bu = { ...defaultBUResult, result: "1", operation: "1XXXX" };
        result.buMux = { signal: "1", result: aluRes };
        result.wb = { signal: "10", result: add4Res.toString(2) };
        break;
    }
    return result;
  }

  private readFromMemory(address: number, control: number): string {
    let value = "";
    switch (control) {
      case 0: {
        // lb
        console.log("reading for lb");
        const val = this.getDataMemory().read(address, 1).join("");
        value = val.padStart(32, val.at(0));
        break;
      }
      case 1: {
        // lh
        console.log("reading for lb");
        const val = this.getDataMemory().read(address, 2).join("");
        value = val.padStart(32, val.at(0));
        break;
      }
      case 2: {
        //lw
        console.log("reading for lw");
        const val = this.getDataMemory().read(address, 4);
        value = val.join("");
        break;
      }
      case 4: {
        //lbu
        console.log("reading for lb");
        const val = this.getDataMemory().read(address, 1).join("");
        value = val.padStart(32, "0");
        break;
      }
      case 5: {
        // lhu
        console.log("reading for lb");
        const val = this.getDataMemory().read(address, 2).join("");
        value = val.padStart(32, "0");
        break;
      }
    }
    return value;
  }

  private executeSInstruction(): SCCPUResult {
    const result: SCCPUResult = { ...defaultSCCPUResult };
    const instruction = this.currentInstruction();

    const baseAddressVal = this.registers.readRegisterFromName(getRs1(instruction));
    const dataToStore = this.registers.readRegisterFromName(getRs2(instruction));

    const offset12Val = this.currentInstruction().encoding.imm12;
    const offset32Val = offset12Val.padStart(32, offset12Val.at(0));
    const add4Res = parseInt(this.currentInstruction().inst) + 4;
    const aluRes = this.computeALURes(baseAddressVal, offset32Val, "0000");

    result.add4.result = add4Res.toString(2);
    result.ru = {
      ...defaultRUResult,
      rs1: baseAddressVal,
      writeSignal: "0",
    };
    result.alu = {
      a: baseAddressVal,
      b: offset32Val,
      operation: "0000",
      result: aluRes,
    };
    result.alua = { result: baseAddressVal, signal: "0" };
    result.alub = { result: offset32Val, signal: "1" };
    result.bu = { ...defaultBUResult, operation: "00XXX", result: "0" };
    result.buMux = { signal: "0", result: add4Res.toString(2) };
    result.dm = {
      ...defaultDMResult,
      address: aluRes,
      controlSignal: getFunct3(instruction),
      dataWr: dataToStore,
      writeSignal: "1",
    };
    result.imm = { signal: "001", output: offset32Val };
    console.log("Result of S instruction: ", result);
    return result;
  }

  private executeBInstruction() {
    const result: SCCPUResult = { ...defaultSCCPUResult };
    const instruction = this.currentInstruction();

    const add4Res = parseInt(instruction.inst) + 4;
    result.add4.result = add4Res.toString(2);

    const funct3 = getFunct3(instruction);
    const rs1 = this.registers.readRegisterFromName(getRs1(instruction));
    const rs2 = this.registers.readRegisterFromName(getRs2(instruction));

    const rs1Int = parseInt(rs1, 2);
    const rs2Int = parseInt(rs2, 2);

    const imm13 = this.currentInstruction().encoding.imm13;
    const imm32Val = imm13.padStart(32, imm13.at(0));

    let condition = false;
    switch (parseInt(funct3, 2)) {
      case 0: {
        //beq
        condition = rs1Int === rs2Int;
        break;
      }
      case 1: {
        //bne
        condition = rs1Int !== rs2Int;
        break;
      }
      case 4: {
        //blt
        condition = rs1Int < rs2Int;
        break;
      }
      case 5: {
        //bge
        condition = rs1Int >= rs2Int;
        break;
      }
      case 6: {
        //bltu
        break;
      }
      case 7: {
        //bgeu
        break;
      }
    }

    const aluaRes = (instruction.inst as number).toString(2);
    const aluaRes32 = aluaRes.padStart(32, "0");
    const aluRes = this.computeALURes(aluaRes32, imm32Val, "0000");

    result.ru = { ...defaultRUResult, writeSignal: "0", rs1: rs1, rs2: rs2 };
    result.alua = { signal: "1", result: aluaRes32 };
    result.alub = { signal: "1", result: imm32Val };
    result.bu = {
      operation: "01" + funct3,
      result: condition ? "1" : "0",
      a: rs1,
      b: rs2,
    };
    result.buMux = {
      result: condition ? parseInt(aluRes, 2).toString(2) : add4Res.toString(2),
      signal: condition ? "1" : "0",
    };
    result.alu = { a: aluaRes, b: imm32Val, operation: "0000", result: aluRes };
    result.imm = { signal: "101", output: imm32Val };
    return result;
  }

  private executeUInstruction() {
    const result: SCCPUResult = { ...defaultSCCPUResult };
    const instruction = this.currentInstruction();

    const add4Res = (parseInt(instruction.inst) + 4).toString(2);
    result.add4.result = add4Res;

    const imm21Val = this.currentInstruction().encoding.imm21;
    const imm32Val = imm21Val.padEnd(32, "0");

    let aVal = "0".padStart(32, "0");
    let aluASrcVal = "0";
    let aluAResVal = "0".padStart(32, "0");
    let aluRes = imm32Val;
    if (isAUIPC(instruction.type, instruction.opcode)) {
      const PC = instruction.inst as number;
      aVal = PC.toString(2).padStart(32, "0");
      aluASrcVal = "1";
      aluAResVal = aVal;
      aluRes = (PC + parseInt(imm32Val, 2)).toString(2).padStart(32, "0");
    }

    result.ru = { ...defaultRUResult, writeSignal: "1", dataWrite: aluRes };
    result.imm = { signal: "010", output: imm32Val };
    result.alub = { result: imm32Val, signal: "1" };
    result.alua = { result: aluAResVal, signal: aluASrcVal };
    result.bu = { ...defaultBUResult, result: "0", operation: "00XXX" };
    result.alu = { operation: "0000", result: aluRes, a: aVal, b: imm32Val };
    result.buMux = { result: add4Res, signal: "0" };
    result.wb = { result: imm32Val, signal: "00" };
    return result;
  }

  private executeJInstruction() {
    const result: SCCPUResult = { ...defaultSCCPUResult };
    const instruction = this.currentInstruction();

    const pc = parseInt(instruction.inst);
    const pcVal = pc.toString(2).padStart(32, "0");
    const add4Res = (pc + 4).toString(2).padStart(32, "0");
    result.add4.result = add4Res;
    const imm21Val = this.currentInstruction().encoding.imm21 as string;
    const imm32Val = imm21Val.padStart(32, "0");

    const aluRes = this.computeALURes(pcVal, imm32Val, "0000");

    result.alua = { result: pcVal, signal: "1" };
    result.alub = { result: imm32Val, signal: "1" };
    result.imm = { output: imm32Val, signal: "110" };
    result.alu = {
      a: pc.toString(2),
      b: imm32Val,
      operation: "0000",
      result: aluRes,
    };
    result.buMux = { result: aluRes, signal: "1" };
    result.bu = { ...defaultBUResult, operation: "1XXXX", result: "1" };
    result.ru = { ...defaultRUResult, writeSignal: "1", dataWrite: add4Res };
    result.wb = { result: add4Res, signal: "10" };
    return result;
  }

  public getRegisterFile(): RegistersFile {
    return this.registers;
  }

  public getDataMemory(): DataMemory {
    return this.dataMemory;
  }

  public replaceDataMemory(newMemory: any[]): void {
    const flatMemory: string[] = [];
    newMemory.forEach((group) => {
      flatMemory.push(group.value0, group.value1, group.value2, group.value3);
    });

    (this.dataMemory as any).memory = flatMemory;
  }

  public printInfo() {
    logger().info("CPU state");
    logger().info("Registers");
    this.registers.printRegisters();
  }
}
