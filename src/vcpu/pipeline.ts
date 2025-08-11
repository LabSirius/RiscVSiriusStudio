/* eslint-disable @typescript-eslint/naming-convention */

import { ICPU } from "./interface";
import { RegistersFile, DataMemory, ProcessorALU } from "./components/components";
import { ControlUnit, ImmediateUnit } from "./components/decoder";
import { getFunct3 } from "../utilities/instructions";

const NOP_DATA = {
  instruction: { asm: "NOP", pc: -1 },
  PC: -1,
  PCP4: 0,
  RUWr: false,
  ALUASrc: false,
  ALUBSrc: false,
  DMWr: false,
  RUDataWrSrc: "XX",
  ALUOp: "XXXXX",
  BrOp: "XXXXX",
  DMCtrl: "XXX",
  RUrs1: "X".padStart(32, "X"),
  RUrs2: "X".padStart(32, "X"),
  ImmExt: "X".padStart(32, "X"),
  RD: "XXXXX",
  rs1: "XXXXX",
  rs2: "XXXXX",
  ALURes: "X".padStart(32, "X"),
};

interface IDEX_Register {
  instruction: any;
  PC: number;
  PCP4: number;
  RUWr: boolean;
  ALUASrc: boolean;
  ALUBSrc: boolean;
  DMWr: boolean;
  RUDataWrSrc: string;
  DMCtrl: string;
  ALUOp: string;
  BrOp: string;
  RUrs1: string;
  RUrs2: string;
  ImmExt: string;
  RD: string;
  rs1: string;
  rs2: string;
}

interface EXMEM_Register {
  instruction: any;
  PCP4: number;
  RUWr: boolean;
  DMWr: boolean;
  RUDataWrSrc: string;
  DMCtrl: string;
  ALURes: string;
  RUrs2: string;
  RD: string;
}

export class PipelineCPU implements ICPU {
  private readonly program: any[];
  private dataMemory: DataMemory;
  private registers: RegistersFile;
  private controlUnit: ControlUnit;
  private immediateUnit: ImmediateUnit;
  private alu: ProcessorALU;

  private clockCycles: number = 0;
  private pc: number = 0;

  private if_id_register: { instruction: any; PC: number; PCP4: number };
  private id_ex_register: IDEX_Register;
  private ex_mem_register: EXMEM_Register;

  constructor(program: any[], memory: any[], memSize: number) {
    this.program = program;
    this.registers = new RegistersFile();
    this.dataMemory = new DataMemory(program.length * 4, memory.length, memSize);
    this.dataMemory.uploadProgram(memory);
    this.controlUnit = new ControlUnit();
    this.immediateUnit = new ImmediateUnit();
    this.alu = new ProcessorALU();

    this.if_id_register = { instruction: null, PC: -1, PCP4: 0 };
    this.id_ex_register = { ...NOP_DATA };
    this.ex_mem_register = { ...NOP_DATA };
  }

  public cycle(): any {
    this.clockCycles++;
    console.log(`\n--- [Pipeline CPU] Clock Cycle: ${this.clockCycles} ---`);
    this.executeEX();
    this.executeID();
    this.executeIF();
    return {};
  }

  private executeIF() {
    const PC_fe = this.pc;
    let instruction: any = null;
    if (PC_fe / 4 < this.program.length) {
      instruction = this.program[PC_fe / 4];
    }
    const PCP4 = PC_fe + 4;
    this.if_id_register = { instruction, PC: PC_fe, PCP4 };
    this.pc = PCP4;
    console.log(`[IF Stage] Fetching PC=${PC_fe}. Instruction: "${instruction?.asm || "STALL/END"}"`);
  }

  private executeID() {
    const { instruction, PC, PCP4 } = this.if_id_register;

    if (!instruction) {
      this.id_ex_register = { ...NOP_DATA };
      console.log("[ID Stage] NOP");
      return;
    }

    console.log(`[ID Stage] Processing: "${instruction.asm}" (PC=${PC})`);
    const controls = this.controlUnit.generate(instruction);
    const ImmExt = this.immediateUnit.generate(instruction);

    const rs1Addr = instruction.rs1?.regeq;
    const rs2Addr = instruction.rs2?.regeq;
    const RUrs1 = rs1Addr ? this.registers.readRegisterFromName(rs1Addr) : "X".padStart(32, "X");
    const RUrs2 = rs2Addr ? this.registers.readRegisterFromName(rs2Addr) : "X".padStart(32, "X");

    console.log(`[ID Stage] Read Registers: rs1(${rs1Addr || 'N/A'}) -> ${RUrs1} | rs2(${rs2Addr || 'N/A'}) -> ${RUrs2}`);
    

    this.id_ex_register = {
      instruction,
      PC,
      PCP4,
      RUWr: controls.ru_wr,
      ALUASrc: controls.alua_src,
      ALUBSrc: controls.alub_src,
      DMWr: controls.dm_wr,
      RUDataWrSrc: controls.ru_data_wr_src,
      ALUOp: controls.alu_op,
      BrOp: controls.br_op,
      // El resto de los datos
      DMCtrl: getFunct3(instruction) || "XXX",
      RUrs1,
      RUrs2,
      ImmExt,
      RD: instruction.rd ? instruction.rd.regeq.substring(1).padStart(5, '0') : "XXXXX",
      rs1: instruction.rs1 ? instruction.rs1.regeq.substring(1).padStart(5, '0') : "XXXXX",
      rs2: instruction.rs2 ? instruction.rs2.regeq.substring(1).padStart(5, '0') : "XXXXX",
    };
    // ======================================================================

    console.log(`[ID Stage] ID/EX Register OUT ->`, this.id_ex_register);
  }

  private executeEX() {
    const { instruction, PC, PCP4, ALUASrc, ALUBSrc, ALUOp, BrOp, RUrs1, RUrs2, ImmExt } = this.id_ex_register;

    if (PC === -1) {
        this.ex_mem_register = { ...NOP_DATA };
        console.log(`[EX Stage] NOP`);
        return;
    }

    console.log(`[EX Stage] Processing: "${instruction.asm}" (PC=${PC})`);

    const operandA = ALUASrc ? PC.toString(2).padStart(32, '0') : RUrs1;
    const operandB = ALUBSrc ? ImmExt : RUrs2;
    const ALURes = this.alu.execute(operandA, operandB, ALUOp);
    
    console.log(`[EX Stage] Branch control signal received: BrOp=${BrOp}`);

    console.log(`[EX Stage] ALU Inputs:
      Operand A: ${operandA} ${ALUASrc ? "(from PC)" : "(from RUrs1)"}
      Operand B: ${operandB} ${ALUBSrc ? "(from ImmExt)" : "(from RUrs2)"}
      ALU Op: ${ALUOp}`);
    console.log(`[EX Stage] ALU Result: ${ALURes}`);

    this.ex_mem_register = {
      instruction,
      PCP4,
      RUWr: this.id_ex_register.RUWr,
      DMWr: this.id_ex_register.DMWr,
      RUDataWrSrc: this.id_ex_register.RUDataWrSrc,
      DMCtrl: this.id_ex_register.DMCtrl,
      ALURes,
      RUrs2: this.id_ex_register.RUrs2,
      RD: this.id_ex_register.RD,
    };
    
    console.log(`[EX Stage] EX/MEM Register OUT ->`, this.ex_mem_register);
  }

  public getDataMemory(): DataMemory { return this.dataMemory; }
  public getRegisterFile(): RegistersFile { return this.registers; }
  public getPC(): number { return this.pc; }
  public currentInstruction(): any { return this.if_id_register.instruction || {}; }
  public finished(): boolean { return false; }
  public jumpToInstruction(address: string): void { console.warn(`jumpToInstruction(${address}) not yet implemented for pipeline.`); }
  public nextInstruction(): void {}
  public replaceDataMemory(newMemory: any[]): void { this.dataMemory.uploadProgram(newMemory); }
  public replaceRegisters(newRegisters: string[]): void { (this.registers as any).registers = newRegisters; }
}