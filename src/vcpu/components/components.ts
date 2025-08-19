/* eslint-disable @typescript-eslint/naming-convention */

import { logger } from "../../utilities/logger";
import { ALU32 } from "../alu32";

//REGISTERS
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

//DATA MEMORY
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
  get constantsSize(): number {
    return this._constantsSize;
  }

  public constructor(programSize: number, codeSize: number, size: number) {
    this.codeAreaEnd = codeSize - 1;
    this._constantsSize = codeSize - programSize;
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

/**
 * Simulates the main Arithmetic Logic Unit of the processor.
 */
export class ProcessorALU {
  /**
   * Executes an operation based on the ALUOp control signal.
   * @param A First operand (32-bit string)
   * @param B Second operand (32-bit string)
   * @param ALUOp The operation code for the ALU
   * @returns The 32-bit result as a string
   */
  public execute(A: string, B: string, ALUOp: string): string {
    const numA = "0b" + A;
    const numB = "0b" + B;
    let result: BigInt = 0n;
    switch (ALUOp) {
      case "00000":
        result = ALU32.addition(numA, numB);
        break;
      case "01000":
        result = ALU32.subtraction(numA, numB);
        break;
      case "00100":
        result = ALU32.xor(numA, numB);
        break;
      case "00110":
        result = ALU32.or(numA, numB);
        break;
      case "00111":
        result = ALU32.and(numA, numB);
        break;
      case "00001":
        result = ALU32.shiftLeft(numA, numB);
        break;
      case "00101":
        result = ALU32.shiftRight(numA, numB);
        break;
      case "01101":
        result = ALU32.shiftRightA(numA, numB);
        break;
      case "00010":
        result = ALU32.lessThan(numA, numB);
        break;
      case "00011":
        result = ALU32.lessThanU(numA, numB);
        break;
      case "10000":
        result = ALU32.mul(numA, numB);
        break;
      case "10001":
        result = ALU32.mulh(numA, numB);
        break;
      case "10010":
        result = ALU32.mulsu(numA, numB);
        break;
      case "10011":
        result = ALU32.mulu(numA, numB);
        break;
      case "10100":
        result = ALU32.div(numA, numB);
        break;
      case "10101":
        result = ALU32.divu(numA, numB);
        break;
      case "10110":
        result = ALU32.rem(numA, numB);
        break;
      case "10111":
        result = ALU32.remu(numA, numB);
        break;
      default:
        result = 0n;
    }
    return this.toTwosComplement(result, 32);
  }

  private toTwosComplement(n: any, len: any): string {
    n = BigInt(n);
    len = Number(len);
    if (!Number.isInteger(len)) {
      throw Error("`len` must be an integer");
    }
    if (len <= 0) {
      throw Error("`len` must be greater than zero");
    }
    if (n >= 0) {
      n = n.toString(2);
      if (n.length > len) {
        throw Error("out of range");
      }
      return n.padStart(len, "0");
    }
    n = (-n).toString(2);
    if (!(n.length < len || n === "1".padEnd(len, "0"))) {
      throw Error("out of range");
    }
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
}

/** Implements the Branch Unit logic.
 */
export class BranchUnit {
  /**
   * English: Evaluates if a branch condition is met.
   * @param brOp The 5-bit Branch Operation control signal.
   * @param val1 The first value for comparison (from rs1).
   * @param val2 The second value for comparison (from rs2).
   * @returns `true` if the branch should be taken, `false` otherwise.
   */
  public evaluate(brOp: string, val1: string, val2: string): boolean {

    const opType = brOp.substring(0, 2);

    if (opType === "10" || opType === "11") {
      // Corresponds to 2'b1x in Verilog (JAL, JALR)
      return true; // Unconditional jump
    }

    if (opType === "01") {
      // Corresponds to 2'b01 in Verilog (Conditional Branches)
      const num1_signed = BigInt.asIntN(32, BigInt(`0b${val1}`));
      const num2_signed = BigInt.asIntN(32, BigInt(`0b${val2}`));
      // -------------------------

      const num1_unsigned = BigInt(`0b${val1}`);
      const num2_unsigned = BigInt(`0b${val2}`);

      const condition = brOp.substring(2, 5); // Gets funct3
      switch (condition) {
        case "000":
          return num1_signed === num2_signed; // BEQ
        case "001":
          return num1_signed !== num2_signed; // BNE
        case "100":
          return num1_signed < num2_signed; // BLT
        case "101":
          return num1_signed >= num2_signed; // BGE
        case "110":
          return num1_unsigned < num2_unsigned; // BLTU
        case "111":
          return num1_unsigned >= num2_unsigned; // BGEU
        default:
          return false;
      }
    }

    // Default case, includes 2'b00 from Verilog (not a branch).
    return false;
  }
}
