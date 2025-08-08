/* eslint-disable @typescript-eslint/naming-convention */

import {
  getRs1,
  getRs2,
  getRd,
  getFunct3,
  getFunct7,
  isIArithmetic,
  isILoad,
  isIJump,
  isAUIPC,
  isILogical,
  getImmFunct7,
} from "../utilities/instructions";
import { ALU32 } from "./alu32";
import { intToBinary } from "../utilities/conversions";
import { ICPU } from "./interface";
import { RegistersFile, DataMemory } from "./components";
import { ImmediateUnit } from "./components";

type ALUResult = { a: string; b: string; operation: string; result: string };
const defaultALUResult = {
  a: "".padStart(32, "0"),
  b: "".padStart(32, "0"),
  result: "".padStart(32, "0"),
  operation: "".padStart(4, "0"),
};
type ADD4Result = { result: string };
const defaultADD4Result = { result: "".padStart(32, "0") };
type MuxResult = { signal: string; result: string };
const defaultMuxResult = { signal: "X", result: "".padStart(32, "0") };
type BUResult = { a: string; b: string; operation: string; result: string };
const defaultBUResult = {
  a: "".padStart(32, "0"),
  b: "".padStart(32, "0"),
  operation: "".padStart(5, "X"),
  result: "X",
};
type IMMResult = { signal: string; output: string };
const defaultIMMResult = { signal: "".padStart(3, "X"), output: "".padStart(32, "0") };
type DMResult = {
  address: string;
  dataWr: string;
  dataRd: string;
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
type RUResult = { rs1: string; rs2: string; dataWrite: string; writeSignal: string };
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
export const defaultSCCPUResult = {
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

export class SCCPU implements ICPU {
  private readonly _program: any[];
  private registers: RegistersFile;
  private dataMemory: DataMemory;
  private immediateUnit: ImmediateUnit;
  private pc: number;

  get program() {
    return this._program;
  }
  public getPC() {
    return this.pc;
  }

  public constructor(program: any[], memory: any[], memSize: number) {
    this._program = program.filter((sc) => sc.kind === "SrcInstruction");
    this.registers = new RegistersFile();
    this.dataMemory = new DataMemory(program.length * 4, memory.length, memSize);
    this.dataMemory.uploadProgram(memory);
    this.pc = 0;
    this.immediateUnit = new ImmediateUnit();
    const programSize = program.length * 4;
    this.registers.writeRegister("x2", intToBinary(programSize + memSize - 4));
  }

  public currentInstruction() {
    return this._program[this.pc];
  }

  private currentType(): string {
    return this.currentInstruction().type;
  }

  private currentOpcode(): string {
    return this.currentInstruction().opcode;
  }

  public finished(): boolean {
    return this.pc >= this._program.length;
  }

  public nextInstruction() {
    this.pc++;
  }

  public jumpToInstruction(address: string) {
    this.pc = parseInt(address, 2) / 4;
  }

  private toTwosComplement(n: any, len: any) {
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

  private computeALURes(A: string, B: string, ALUOp: string): string {
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

  public cycle(): SCCPUResult {
    switch (this.currentType()) {
      case "R":
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
    const funct7 = getFunct7(instruction);
    const aluOp = funct7[6] + funct7[1] + getFunct3(instruction);
    const aluRes = this.computeALURes(rs1Val, rs2Val, aluOp);
    const add4Res = parseInt(this.currentInstruction().inst) + 4;
    this.registers.writeRegister(getRd(instruction), aluRes);
    result.add4.result = add4Res.toString(2);
    result.ru = { rs1: rs1Val, rs2: rs2Val, dataWrite: aluRes, writeSignal: "1" };
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
    const add4Res = parseInt(this.currentInstruction().inst) + 4;

    const imm32Val = this.immediateUnit.generate(instruction);

    let aluOp = "";
    switch (true) {
      case isIArithmetic(instruction.type, instruction.opcode):
        const MSBaluOp = isILogical(instruction.instruction)
          ? getImmFunct7(instruction.encoding.imm12)[1]!
          : "0";
        aluOp = "0" + MSBaluOp + getFunct3(instruction);
        break;
      case isILoad(this.currentType(), this.currentOpcode()):
        aluOp = "00000";
        break;
      case isIJump(this.currentType(), this.currentOpcode()):
        aluOp = "00000";
        break;
    }

    const aluRes = this.computeALURes(rs1Val, imm32Val, aluOp);
    this.registers.writeRegister(getRd(instruction), aluRes);
    result.add4.result = add4Res.toString(2);
    result.ru = { ...defaultRUResult, rs1: rs1Val, writeSignal: "1" };
    result.alu = { a: rs1Val, b: imm32Val, operation: aluOp, result: aluRes };
    result.imm = { signal: "000", output: imm32Val };
    result.alua = { result: rs1Val, signal: "0" };
    result.alub = { result: imm32Val, signal: "1" };

    switch (true) {
      case isIArithmetic(instruction.type, instruction.opcode):
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
        const val = this.dataMemory.read(address, 1).join("");
        value = val.padStart(32, val.at(0));
        break;
      }
      case 1: {
        // lh
        const val = this.dataMemory.read(address, 2).join("");
        value = val.padStart(32, val.at(0));
        break;
      }
      case 2: {
        // lw
        const val = this.dataMemory.read(address, 4);
        value = val.join("");
        break;
      }
      case 4: {
        // lbu
        const val = this.dataMemory.read(address, 1).join("");
        value = val.padStart(32, "0");
        break;
      }
      case 5: {
        // lhu
        const val = this.dataMemory.read(address, 2).join("");
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

    const offset32Val = this.immediateUnit.generate(instruction);

    const add4Res = parseInt(this.currentInstruction().inst) + 4;
    const aluRes = this.computeALURes(baseAddressVal, offset32Val, "00000");
    result.add4.result = add4Res.toString(2);
    result.ru = { ...defaultRUResult, rs1: baseAddressVal, rs2: dataToStore, writeSignal: "0" };
    result.alu = { a: baseAddressVal, b: offset32Val, operation: "0000", result: aluRes };
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
    return result;
  }

  private executeBInstruction() {
    const result: SCCPUResult = { ...defaultSCCPUResult };
    const instruction = this.currentInstruction();
    const add4Res = parseInt(instruction.inst) + 4;
    result.add4.result = add4Res.toString(2);
    const funct3 = getFunct3(instruction);
    const rs1Val = this.registers.readRegisterFromName(getRs1(instruction));
    const rs2Val = this.registers.readRegisterFromName(getRs2(instruction));
    const rs1Int = BigInt.asIntN(32, BigInt("0b" + rs1Val));
    const rs2Int = BigInt.asIntN(32, BigInt("0b" + rs2Val));

    const imm32Val = this.immediateUnit.generate(instruction);

    let condition = false;
    switch (parseInt(funct3, 2)) {
      case 0:
        condition = rs1Int === rs2Int;
        break;
      case 1:
        condition = rs1Int !== rs2Int;
        break;
      case 4:
        condition = rs1Int < rs2Int;
        break;
      case 5:
        condition = rs1Int >= rs2Int;
        break;
      case 6:
        condition =
          BigInt.asUintN(32, BigInt("0b" + rs1Val)) < BigInt.asUintN(32, BigInt("0b" + rs2Val));
        break;
      case 7:
        condition =
          BigInt.asUintN(32, BigInt("0b" + rs1Val)) >= BigInt.asUintN(32, BigInt("0b" + rs2Val));
        break;
    }

    const pcAsString = (instruction.inst as number).toString(2).padStart(32, "0");
    const aluRes = this.computeALURes(pcAsString, imm32Val, "00000");

    result.ru = { ...defaultRUResult, writeSignal: "0", rs1: rs1Val, rs2: rs2Val };
    result.alua = { signal: "1", result: pcAsString };
    result.alub = { signal: "1", result: imm32Val };
    result.bu = { operation: "01" + funct3, result: condition ? "1" : "0", a: rs1Val, b: rs2Val };
    result.buMux = {
      result: condition ? aluRes : add4Res.toString(2),
      signal: condition ? "1" : "0",
    };
    result.alu = { a: pcAsString, b: imm32Val, operation: "0000", result: aluRes };
    result.imm = { signal: "101", output: imm32Val };
    return result;
  }

  private executeUInstruction() {
    const result: SCCPUResult = { ...defaultSCCPUResult };
    const instruction = this.currentInstruction();
    const add4Res = (parseInt(instruction.inst) + 4).toString(2);
    result.add4.result = add4Res;

    const imm32Val = this.immediateUnit.generate(instruction);

    let aluInputA = "0".padStart(32, "0");
    let aluaSignal = "0";
    let aluRes = imm32Val;

    if (isAUIPC(instruction.type, instruction.opcode)) {
      const PC = instruction.inst as number;
      aluInputA = PC.toString(2).padStart(32, "0");
      aluaSignal = "1";
      aluRes = (PC + parseInt(imm32Val, 2)).toString(2).padStart(32, "0");
    }

    result.ru = { ...defaultRUResult, writeSignal: "1", dataWrite: aluRes };
    result.imm = { signal: "010", output: imm32Val };
    result.alub = { result: imm32Val, signal: "1" };
    result.alua = { result: aluInputA, signal: aluaSignal };
    result.bu = { ...defaultBUResult, result: "0", operation: "00XXX" };
    result.alu = { operation: "00000", result: aluRes, a: aluInputA, b: imm32Val };
    result.buMux = { result: add4Res, signal: "0" };
    result.wb = { result: aluRes, signal: "00" };
    return result;
  }

  private executeJInstruction() {
    const result: SCCPUResult = { ...defaultSCCPUResult };
    const instruction = this.currentInstruction();
    const pc = parseInt(instruction.inst);
    const pcVal = pc.toString(2).padStart(32, "0");
    const add4Res = (pc + 4).toString(2).padStart(32, "0");
    result.add4.result = add4Res;

    const imm32Val = this.immediateUnit.generate(instruction);

    const aluRes = this.computeALURes(pcVal, imm32Val, "00000");

    result.alua = { result: pcVal, signal: "1" };
    result.alub = { result: imm32Val, signal: "1" };
    result.imm = { output: imm32Val, signal: "110" };
    result.alu = { a: pc.toString(2), b: imm32Val, operation: "00000", result: aluRes };
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
    if (!newMemory) {
      return;
    }
    const flatMemory: string[] = [];
    newMemory.forEach((group) => {
      flatMemory.push(group.value0, group.value1, group.value2, group.value3);
    });
    (this.dataMemory as any).memory = flatMemory;
  }
  public replaceRegisters(newRegisters: string[]): void {
    (this.registers as any).registers = newRegisters;
  }
  public printInfo() {
    console.log("CPU state");
    console.log("Registers");
    this.registers.printRegisters();
  }
}
