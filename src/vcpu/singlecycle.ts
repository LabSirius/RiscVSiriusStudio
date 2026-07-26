/* eslint-disable @typescript-eslint/naming-convention */

import { DecodedInstruction } from "./instruction";
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
  private halted: boolean = false;


  get program() {
    return this._program;
  }
  public getPC() {
    return this.pc;
  }

   public getProgram(): any[] {
    return this.program;
  }


  public constructor(program: any[], programMemory: any[], writableDirectives: any[], readOnlyDirectives: any[], availableMemSize: number) {


    this._program = program.filter((sc) => sc.kind === "SrcInstruction");
    this.registers = new RegistersFile();
    this.dataMemory = new DataMemory(writableDirectives, readOnlyDirectives, availableMemSize);

    this.pc = 0;
    this.immediateUnit = new ImmediateUnit();
    this.alu = new ProcessorALU();
    this.controlUnit = new ControlUnit();

    this.dataMemory.uploadProgram(programMemory);

    const spAbsoluteAddress = this.dataMemory.availableSpInitialAddress;
    this.registers.writeRegister("x2", intToBinary(spAbsoluteAddress));
  }


  public currentInstruction() {
    return this._program[this.pc];
  }
  private currentType(): string {
    return this.currentInstruction().type;
  }
  public finished(): boolean {
    return this.halted || this.pc >= this._program.length;
  }
  public nextInstruction() {
    this.pc++;
  }
  public jumpToInstruction(address: string) {
    this.pc = parseInt(address, 2) / 4;
  }

  /**
   * Advances one clock: executes the current instruction (register writes,
   * loads and stores commit internally), detects halt (`ebreak`), then advances
   * the program counter. `buMux.result` holds the next-PC byte address for every
   * instruction type — sequential fall-through or branch/jump target — so a
   * single assignment drives all control flow. The returned `SCCPUResult` is a
   * datapath-wire observation, not the computation the caller must replay.
   */
  public cycle(): SCCPUResult {
    const instruction = this.currentInstruction();
    let result: SCCPUResult;
    switch (this.currentType()) {
      case "R":
        result = this.executeRInstruction();
        break;
      case "I":
        result = this.executeIInstruction();
        break;
      case "S":
        result = this.executeSInstruction();
        break;
      case "B":
        result = this.executeBInstruction();
        break;
      case "U":
        result = this.executeUInstruction();
        break;
      case "J":
        result = this.executeJInstruction();
        break;
      default:
        throw new Error("Unknown instruction " + JSON.stringify(instruction));
    }
    if (this.isHalt(instruction)) {
      this.halted = true;
    }
    // buMux.result is the next-PC byte address for every instruction type, so
    // jumpToInstruction drives sequential fall-through and taken branches alike.
    this.jumpToInstruction(result.buMux.result);
    return result;
  }

  /** `ebreak` (SYSTEM opcode, funct3 000, imm12 = 1) halts the CPU. */
  private isHalt(instruction: any): boolean {
    return (
      instruction.opcode === "1110011" &&
      DecodedInstruction.from(instruction).funct3() === "000" &&
      instruction.encoding.imm12 === "000000000001"
    );
  }

  private executeRInstruction() {
    const result: SCCPUResult = { ...defaultSCCPUResult };
    const instruction = this.currentInstruction();
    const decoded = DecodedInstruction.from(instruction);
    const controls = this.controlUnit.generate(instruction);
    const rs1Val = this.registers.readRegisterFromName(decoded.rs1());
    const rs2Val = this.registers.readRegisterFromName(decoded.rs2());
    const aluRes = this.alu.execute(rs1Val, rs2Val, controls.alu_op);
    const add4Res = parseInt(this.currentInstruction().inst) + 4;
    this.registers.writeRegister(decoded.rd(), aluRes);
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
    const decoded = DecodedInstruction.from(instruction);
    const controls = this.controlUnit.generate(instruction);
    const rs1Val = this.registers.readRegisterFromName(decoded.rs1());
    const add4Res = parseInt(this.currentInstruction().inst) + 4;
    const imm32Val = this.immediateUnit.generate(instruction);
    const aluRes = this.alu.execute(rs1Val, imm32Val, controls.alu_op);
    let wbData = "";

    if (controls.ru_data_wr_src === "00") {
      // Result from ALU
      wbData = aluRes;
    } else if (controls.ru_data_wr_src === "01") {
      // Result from Memory
      let value = this.readFromMemory(parseInt(aluRes, 2), decoded);
      wbData = value;
      result.dm = {
        ...defaultDMResult,
        address: aluRes,
        writeSignal: "0",
        controlSignal: decoded.funct3(),
        dataRd: value,
      };
    } else {
      // Result is PC+4
      wbData = add4Res.toString(2);
    }

    if (controls.ru_wr) {
      this.registers.writeRegister(decoded.rd(), wbData);
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

    if (decoded.isIJump()) {
      result.bu = { ...defaultBUResult, result: "1", operation: "1XXXX" };
      result.buMux = { signal: "1", result: aluRes };
    } else {
      result.bu = { ...defaultBUResult, result: "0", operation: "00XXX" };
      result.buMux = { signal: "0", result: add4Res.toString(2) };
    }

    return result;
  }

  /**
   * Reads a load's value from data memory. Width and sign/zero extension come
   * from the instruction's `memoryAccess()` fact and `extend()` helper; this
   * CPU still performs the actual `DataMemory.read`.
   */
  private readFromMemory(address: number, decoded: DecodedInstruction): string {
    const access = decoded.memoryAccess()!;
    const bits = this.dataMemory.read(address, access.bytes).join("");
    return decoded.extend(bits);
  }

  private executeSInstruction(): SCCPUResult {
    const result: SCCPUResult = { ...defaultSCCPUResult };
    const instruction = this.currentInstruction();
    const decoded = DecodedInstruction.from(instruction);
    const controls = this.controlUnit.generate(instruction);
    const baseAddressVal = this.registers.readRegisterFromName(decoded.rs1());
    const dataToStore = this.registers.readRegisterFromName(decoded.rs2());
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
      controlSignal: decoded.funct3(),
      dataWr: dataToStore,
      writeSignal: "1",
    };
    result.imm = { signal: "001", output: offset32Val };
    this.commitStore(aluRes, dataToStore);
    return result;
  }

  /**
   * Commits a store to data memory. The full 32-bit word is written
   * little-endian for every store width — the CPU's long-standing behaviour,
   * formerly re-implemented by the Simulator and the golden driver off the
   * `dm` render wires.
   */
  private commitStore(address: string, data: string): void {
    const dataWr = data.length < 32 ? data.padStart(32, "0") : data;
    const addr = parseInt(address, 2);
    const bytes = (dataWr.match(/.{1,8}/g) as string[]).reverse();
    if (!this.dataMemory.canWrite(bytes.length, addr)) {
      throw new Error(`Cannot write to address ${addr.toString(16)}.`);
    }
    this.dataMemory.write(bytes, addr);
  }

  private executeBInstruction() {
    const result: SCCPUResult = { ...defaultSCCPUResult };
    const instruction = this.currentInstruction();
    const decoded = DecodedInstruction.from(instruction);
    const controls = this.controlUnit.generate(instruction);
    const add4Res = parseInt(instruction.inst) + 4;
    result.add4.result = add4Res.toString(2);
    const funct3 = decoded.funct3();
    const rs1Val = this.registers.readRegisterFromName(decoded.rs1());
    const rs2Val = this.registers.readRegisterFromName(decoded.rs2());
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
    const decoded = DecodedInstruction.from(instruction);
    const controls = this.controlUnit.generate(instruction);
    const add4Res = (parseInt(instruction.inst) + 4).toString(2);
    result.add4.result = add4Res;
    const imm32Val = this.immediateUnit.generate(instruction);
    let aluInputA = "0".padStart(32, "0");
    let aluRes = imm32Val;

    if (decoded.isAUIPC()) {
      const PC = instruction.inst as number;
      aluInputA = PC.toString(2).padStart(32, "0");
      aluRes = this.alu.execute(aluInputA, imm32Val, controls.alu_op);
    }

    if (controls.ru_wr) {
      this.registers.writeRegister(decoded.rd(), aluRes);
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
    const decoded = DecodedInstruction.from(instruction);
    const controls = this.controlUnit.generate(instruction);
    const pc = parseInt(instruction.inst);
    const pcVal = pc.toString(2).padStart(32, "0");
    const add4Res = (pc + 4).toString(2).padStart(32, "0");
    result.add4.result = add4Res;
    const imm32Val = this.immediateUnit.generate(instruction);
    const aluRes = this.alu.execute(pcVal, imm32Val, controls.alu_op);

    if (controls.ru_wr) {
      this.registers.writeRegister(decoded.rd(), add4Res);
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
    this.registers.printRegisters();
  }
}
