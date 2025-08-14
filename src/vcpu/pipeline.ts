/* eslint-disable @typescript-eslint/naming-convention */

import { ICPU } from "./interface";
import { RegistersFile, DataMemory, ProcessorALU } from "./components/components";
import { ControlUnit, ImmediateUnit } from "./components/decoder";
import { getFunct3 } from "../utilities/instructions";
import { intToBinary } from "../utilities/conversions";

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
  RD: "X",
  rs1: "X",
  rs2: "X",
  ALURes: "X".padStart(32, "X"),
  MemReadData: "X".padStart(32, "X"),
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
  PC: number;
  PCP4: number;
  RUWr: boolean;
  DMWr: boolean;
  RUDataWrSrc: string;
  DMCtrl: string;
  ALURes: string;
  RUrs2: string;
  RD: string;
}

interface MEMWB_Register {
  instruction: any;
  PC: number;
  PCP4: number;
  RUWr: boolean;
  RUDataWrSrc: string;
  ALURes: string;
  MemReadData: string;
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
  private mem_wb_register: MEMWB_Register;

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
    this.mem_wb_register = { ...NOP_DATA };
    const programSize = program.length * 4;
    this.registers.writeRegister("x2", intToBinary(programSize + memSize - 4));
  }

  public cycle(): any {
    this.clockCycles++;
    console.log(`\n--- [Pipeline CPU] Clock Cycle: ${this.clockCycles} ---`);
    this.executeWB();
    this.executeMEM();
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
    console.log(
      `[IF Stage] Fetching PC=${PC_fe}. Instruction: "${instruction?.asm || "STALL/END"}"`
    );
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
    console.log(
      `[ID Stage] Read Registers: rs1(${rs1Addr || "N/A"}) -> ${RUrs1} | rs2(${
        rs2Addr || "N/A"
      }) -> ${RUrs2}`
    );

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
      DMCtrl: getFunct3(instruction) || "XXX",
      RUrs1,
      RUrs2,
      ImmExt,

      RD: instruction.rd ? instruction.rd.regeq.substring(1) : "X",
      rs1: instruction.rs1 ? instruction.rs1.regeq.substring(1) : "X",
      rs2: instruction.rs2 ? instruction.rs2.regeq.substring(1) : "X",
    };
    console.log(`[ID Stage] ID/EX Register OUT ->`, this.id_ex_register);
  }

  private executeEX() {
    const { instruction, PC, PCP4, ALUASrc, ALUBSrc, ALUOp, BrOp, RUrs1, RUrs2, ImmExt } =
      this.id_ex_register;
    if (PC === -1) {
      this.ex_mem_register = { ...NOP_DATA };
      console.log(`[EX Stage] NOP`);
      return;
    }
    console.log(`[EX Stage] Processing: "${instruction.asm}" (PC=${PC})`);
    const operandA = ALUASrc ? PC.toString(2).padStart(32, "0") : RUrs1;
    const operandB = ALUBSrc ? ImmExt : RUrs2;
    const ALURes = this.alu.execute(operandA, operandB, ALUOp);
    console.log(`[EX Stage] Branch control signal received: BrOp=${BrOp}`);
    console.log(
      `[EX Stage] ALU Inputs:\n      Operand A: ${operandA} ${
        ALUASrc ? "(from PC)" : "(from RUrs1)"
      }\n      Operand B: ${operandB} ${
        ALUBSrc ? "(from ImmExt)" : "(from RUrs2)"
      }\n      ALU Op: ${ALUOp}`
    );
    console.log(`[EX Stage] ALU Result: ${ALURes}`);
    this.ex_mem_register = {
      instruction,
      PC,
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

  private executeMEM() {
    const { instruction, PC, PCP4, DMWr, DMCtrl, ALURes, RUrs2, RD } = this.ex_mem_register;
    if (instruction.pc === -1) {
      this.mem_wb_register = { ...NOP_DATA };
      console.log(`[MEM Stage] NOP`);
      return;
    }
    console.log(`[MEM Stage] Processing: "${instruction.asm}" (PC=${PC})`); 
    const address = parseInt(ALURes, 2);
    let memReadData = "X".padStart(32, "X");
    if (DMWr) {
      const chunks = RUrs2.match(/.{1,8}/g) || [];
      if (chunks[2] && chunks[3]) {
        let bytesToWrite: string[] = [];
        switch (DMCtrl) {
          case "000":
            bytesToWrite = [chunks[3]];
            break;
          case "001":
            bytesToWrite = [chunks[2], chunks[3]];
            break;
          case "010":
            bytesToWrite = chunks;
            break;
        }
        if (bytesToWrite.length > 0) {
          this.dataMemory.write(bytesToWrite.reverse(), address);
          console.log(
            `[MEM Stage] DataMemory.write called at address ${address} with ${bytesToWrite.length} byte(s)`
          );
        }
      } else {
        console.error(
          `[MEM Stage] Error: Dato para Store (RUrs2) no tiene el formato de 32 bits esperado.`
        );
      }

        console.log("new MEMORY", this.getDataMemory());

    } else if (this.ex_mem_register.RUDataWrSrc === "01") {
      switch (DMCtrl) {
        case "000": {
          const v = this.dataMemory.read(address, 1).join("");
          memReadData = v.padStart(32, v.at(0) || "0");
          break;
        }
        case "001": {
          const v = this.dataMemory.read(address, 2).join("");
          memReadData = v.padStart(32, v.at(0) || "0");
          break;
        }
        case "010": {
          const v = this.dataMemory.read(address, 4);
          memReadData = v.join("");
          break;
        }
        case "100": {
          const v = this.dataMemory.read(address, 1).join("");
          memReadData = v.padStart(32, "0");
          break;
        }
        case "101": {
          const v = this.dataMemory.read(address, 2).join("");
          memReadData = v.padStart(32, "0");
          break;
        }
      }
      console.log(`[MEM Stage] DataMemory.read from address ${address} -> ${memReadData}`);
    } else {
      console.log(`[MEM Stage] No memory operation.`);
    }
    this.mem_wb_register = {
      instruction,
      PC,
      PCP4, 
      RUWr: this.ex_mem_register.RUWr,
      RUDataWrSrc: this.ex_mem_register.RUDataWrSrc,
      ALURes,
      MemReadData: memReadData,
      RD,
    };
    console.log(`[MEM Stage] MEM/WB Register OUT ->`, this.mem_wb_register);
  }

  private executeWB() {
    const { instruction, PC, PCP4, RUWr, RUDataWrSrc, ALURes, MemReadData, RD } =
      this.mem_wb_register;

    if (instruction.pc === -1) {
      console.log(`[WB Stage] NOP`);
      return;
    }

    console.log(`[WB Stage] Processing: "${instruction.asm}" (PC=${PC})`);

    if (RUWr) {
      let dataToWrite: string;
      switch (RUDataWrSrc) {
        case "00":
          dataToWrite = ALURes;
          console.log(`[WB Stage] Data source: ALU Result (${dataToWrite})`);
          break;
        case "01":
          dataToWrite = MemReadData;
          console.log(`[WB Stage] Data source: Memory Read Data (${dataToWrite})`);
          break;
        case "10":
          dataToWrite = PCP4.toString(2).padStart(32, "0");
          console.log(`[WB Stage] Data source: PC+4 (${dataToWrite})`);
          break;
        default:
          dataToWrite = "X".padStart(32, "X");
          console.log(`[WB Stage] Data source: Unknown`);
          break;
      }

      if (RD !== "X" && RD !== "0") {
        const rdRegName = `x${RD}`;
        this.registers.writeRegister(rdRegName, dataToWrite);
        console.log(`[WB Stage] SUCCESS: Wrote to ${rdRegName} <- ${dataToWrite}`);
        console.log("new REGISTER", this.getRegisterFile());
      } else {
        console.log(`[WB Stage] Write to register x0 or invalid register suppressed.`);
      }
    } else {
      console.log(`[WB Stage] No write to Register Unit (RUWr=false).`);
    }
  }


  public getDataMemory(): DataMemory {
    return this.dataMemory;
  }
  public getRegisterFile(): RegistersFile {
    return this.registers;
  }
  public getPC(): number {
    return this.pc;
  }
  public currentInstruction(): any {
    return this.if_id_register.instruction || {};
  }
  public finished(): boolean {
    return false;
  }
  public jumpToInstruction(address: string): void {
    console.warn(`jumpToInstruction(${address}) not yet implemented for pipeline.`);
  }
  public nextInstruction(): void {}
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
}
