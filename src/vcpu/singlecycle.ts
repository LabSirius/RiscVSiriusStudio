/* eslint-disable @typescript-eslint/naming-convention */

import { getRs1, getRs2, getRd, getFunct3, isIJump, isAUIPC } from "../utilities/instructions";
import { intToBinary } from "../utilities/conversions";
import { ICPU } from "./interface";
import { RegistersFile, DataMemory, ProcessorALU } from "./components/components";
import { ImmediateUnit, ControlUnit } from "./components/decoder";

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
  private alu: ProcessorALU;
  private controlUnit: ControlUnit;
  private pc: number;

  get program() {
    return this._program;
  }
  public getPC() {
    return this.pc;
  }

  public constructor(program: any[], dataMemory: any[], availableMemSize: number) {



    this._program = program.filter((sc) => sc.kind === "SrcInstruction");
    this.registers = new RegistersFile();
    this.dataMemory = new DataMemory(program.length * 4, dataMemory.length, availableMemSize);

    this.dataMemory.uploadProgram(dataMemory);
    this.pc = 0;
    this.immediateUnit = new ImmediateUnit();
    this.alu = new ProcessorALU();
    this.controlUnit = new ControlUnit();

    const spAbsoluteAddress = this.dataMemory.availableSpInitialAddress;
    this.registers.writeRegister("x2", intToBinary(spAbsoluteAddress));
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
    const controls = this.controlUnit.generate(instruction);
    const rs1Val = this.registers.readRegisterFromName(getRs1(instruction));
    const rs2Val = this.registers.readRegisterFromName(getRs2(instruction));
    const aluRes = this.alu.execute(rs1Val, rs2Val, controls.alu_op);
    const add4Res = parseInt(this.currentInstruction().inst) + 4;
    this.registers.writeRegister(getRd(instruction), aluRes);
    result.add4.result = add4Res.toString(2);
    result.ru = { rs1: rs1Val, rs2: rs2Val, dataWrite: aluRes, writeSignal: "1" };
    result.alua = { result: rs1Val, signal: "0" };
    result.alub = { result: rs2Val, signal: "0" };
    result.alu = { a: rs1Val, b: rs2Val, operation: controls.alu_op, result: aluRes };
    result.bu = { ...defaultBUResult, operation: "00XXX", result: "0" };
    result.buMux = { signal: "0", result: add4Res.toString(2) };
    result.wb = { result: aluRes, signal: "00" };
    return result;
  }

  private executeIInstruction(): SCCPUResult {
    const result: SCCPUResult = { ...defaultSCCPUResult };
    const instruction = this.currentInstruction();
    const controls = this.controlUnit.generate(instruction);
    const rs1Val = this.registers.readRegisterFromName(getRs1(instruction));
    const add4Res = parseInt(this.currentInstruction().inst) + 4;
    const imm32Val = this.immediateUnit.generate(instruction);
    const aluRes = this.alu.execute(rs1Val, imm32Val, controls.alu_op);
    let wbData = "";

    if (controls.ru_data_wr_src === "00") {
      // Result from ALU
      wbData = aluRes;
    } else if (controls.ru_data_wr_src === "01") {
      // Result from Memory
      let value = this.readFromMemory(parseInt(aluRes, 2), parseInt(getFunct3(instruction), 2));
      wbData = value;
      result.dm = {
        ...defaultDMResult,
        address: aluRes,
        writeSignal: "0",
        controlSignal: getFunct3(instruction),
        dataRd: value,
      };
    } else {
      // Result is PC+4
      wbData = add4Res.toString(2);
    }

    if (controls.ru_wr) {
      this.registers.writeRegister(getRd(instruction), wbData);
    }

    result.add4.result = add4Res.toString(2);
    result.ru = {
      ...defaultRUResult,
      rs1: rs1Val,
      writeSignal: controls.ru_wr ? "1" : "0",
      dataWrite: wbData,
    };
    result.alu = { a: rs1Val, b: imm32Val, operation: controls.alu_op, result: aluRes };
    result.imm = { signal: "000", output: imm32Val };
    result.alua = { result: rs1Val, signal: "0" };
    result.alub = { result: imm32Val, signal: "1" };
    result.wb = { signal: controls.ru_data_wr_src, result: wbData };

    if (isIJump(this.currentType(), this.currentOpcode())) {
      result.bu = { ...defaultBUResult, result: "1", operation: "1XXXX" };
      result.buMux = { signal: "1", result: aluRes };
    } else {
      result.bu = { ...defaultBUResult, result: "0", operation: "00XXX" };
      result.buMux = { signal: "0", result: add4Res.toString(2) };
    }
    return result;
  }

  private readFromMemory(address: number, control: number): string {
    let value = "";
    switch (control) {
      case 0: {
        const val = this.dataMemory.read(address, 1).join("");
        value = val.padStart(32, val.at(0));
        break;
      }
      case 1: {
        const val = this.dataMemory.read(address, 2).join("");
        value = val.padStart(32, val.at(0));
        break;
      }
      case 2: {
        const val = this.dataMemory.read(address, 4);
        value = val.join("");
        break;
      }
      case 4: {
        const val = this.dataMemory.read(address, 1).join("");
        value = val.padStart(32, "0");
        break;
      }
      case 5: {
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
    const controls = this.controlUnit.generate(instruction);
    const baseAddressVal = this.registers.readRegisterFromName(getRs1(instruction));
    const dataToStore = this.registers.readRegisterFromName(getRs2(instruction));
    const offset32Val = this.immediateUnit.generate(instruction);
    const add4Res = parseInt(this.currentInstruction().inst) + 4;
    const aluRes = this.alu.execute(baseAddressVal, offset32Val, controls.alu_op);
    result.add4.result = add4Res.toString(2);
    result.ru = { ...defaultRUResult, rs1: baseAddressVal, rs2: dataToStore, writeSignal: "0" };
    result.alu = { a: baseAddressVal, b: offset32Val, operation: controls.alu_op, result: aluRes };
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
    const controls = this.controlUnit.generate(instruction);
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
    const aluRes = this.alu.execute(pcAsString, imm32Val, controls.alu_op);
    result.ru = { ...defaultRUResult, writeSignal: "0", rs1: rs1Val, rs2: rs2Val };
    result.alua = { signal: "1", result: pcAsString };
    result.alub = { signal: "1", result: imm32Val };
    result.bu = { operation: controls.br_op, result: condition ? "1" : "0", a: rs1Val, b: rs2Val };
    result.buMux = {
      result: condition ? aluRes : add4Res.toString(2),
      signal: condition ? "1" : "0",
    };
    result.alu = { a: pcAsString, b: imm32Val, operation: controls.alu_op, result: aluRes };
    result.imm = { signal: "101", output: imm32Val };
    return result;
  }

  private executeUInstruction() {
    const result: SCCPUResult = { ...defaultSCCPUResult };
    const instruction = this.currentInstruction();
    const controls = this.controlUnit.generate(instruction);
    const add4Res = (parseInt(instruction.inst) + 4).toString(2);
    result.add4.result = add4Res;
    const imm32Val = this.immediateUnit.generate(instruction);
    let aluInputA = "0".padStart(32, "0");
    let aluRes = imm32Val;

    if (isAUIPC(instruction.type, instruction.opcode)) {
      const PC = instruction.inst as number;
      aluInputA = PC.toString(2).padStart(32, "0");
      aluRes = this.alu.execute(aluInputA, imm32Val, controls.alu_op);
    }

    if (controls.ru_wr) {
      this.registers.writeRegister(getRd(instruction), aluRes);
    }

    result.ru = { ...defaultRUResult, writeSignal: "1", dataWrite: aluRes };
    result.imm = { signal: "010", output: imm32Val };
    result.alub = { result: imm32Val, signal: "1" };
    result.alua = { result: aluInputA, signal: controls.alua_src ? "1" : "0" };
    result.bu = { ...defaultBUResult, result: "0", operation: "00XXX" };
    result.alu = { operation: controls.alu_op, result: aluRes, a: aluInputA, b: imm32Val };
    result.buMux = { result: add4Res, signal: "0" };
    result.wb = { result: aluRes, signal: "00" };
    return result;
  }

  private executeJInstruction() {
    const result: SCCPUResult = { ...defaultSCCPUResult };
    const instruction = this.currentInstruction();
    const controls = this.controlUnit.generate(instruction);
    const pc = parseInt(instruction.inst);
    const pcVal = pc.toString(2).padStart(32, "0");
    const add4Res = (pc + 4).toString(2).padStart(32, "0");
    result.add4.result = add4Res;
    const imm32Val = this.immediateUnit.generate(instruction);
    const aluRes = this.alu.execute(pcVal, imm32Val, controls.alu_op);

    if (controls.ru_wr) {
      this.registers.writeRegister(getRd(instruction), add4Res);
    }

    result.alua = { result: pcVal, signal: "1" };
    result.alub = { result: imm32Val, signal: "1" };
    result.imm = { output: imm32Val, signal: "110" };
    result.alu = { a: pc.toString(2), b: imm32Val, operation: controls.alu_op, result: aluRes };
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
    this.dataMemory.overwriteAvailableMemory(flatMemory);
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
