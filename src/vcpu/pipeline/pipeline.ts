/* eslint-disable @typescript-eslint/naming-convention */

import { ICPU } from "../interface";
import { RegistersFile, DataMemory, ProcessorALU, BranchUnit } from "../components/components";
import { ControlUnit, ImmediateUnit } from "../components/decoder";
import { ForwardingUnit, ForwardingSignals, ForwardingSource } from "./forwarding";
import { getFunct3 } from "../../utilities/instructions";
import { intToBinary } from "../../utilities/conversions";
import { HazardDetectionUnit } from "./hazard";

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
  BranchInputRS1: "X".padStart(32, "X"),
  BranchInputRS2: "X".padStart(32, "X"),
  BranchResult: "0",
  DMCtrl: "XXX",
  RUrs1: "X".padStart(32, "X"),
  RUrs2: "X".padStart(32, "X"),
  ImmExt: "X".padStart(32, "X"),
  ImmSRC: "X",
  RD: "X",
  rs1: "X",
  rs2: "X",
  ALURes: "X".padStart(32, "X"),
  ALUInputA: "X".padStart(32, "X"),
  ALUInputB: "X".padStart(32, "X"),
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
  ImmSRC: string;
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

  ALUASrc: boolean;
  ALUBSrc: boolean;
  ALUOp: string;
  ALUInputA: string;
  ALUInputB: string;

  BrOp: string;
  BranchInputRS1: string;
  BranchInputRS2: string;
  BranchResult: string;
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


interface WB_Register {
  instruction: any;
  RD: string;         
  dataToWrite: string; 
  RUWr: boolean;      
}

export type PipelineCycleResult = {
  IF: { instruction: any; PC: number; PCP4: number };
  ID: IDEX_Register;
  EX: EXMEM_Register;
  MEM: MEMWB_Register;
  WB: WB_Register
};

export class PipelineCPU implements ICPU {
  private readonly program: any[];
  private dataMemory: DataMemory;
  private registers: RegistersFile;
  private controlUnit: ControlUnit;
  private immediateUnit: ImmediateUnit;
  private alu: ProcessorALU;
  private forwardingUnit: ForwardingUnit;
   private hazardDetectionUnit: HazardDetectionUnit;
   private branchUnit: BranchUnit; 

  private clockCycles: number = 0;
  private pc: number = 0;

  private if_id_register: { instruction: any; PC: number; PCP4: number };
  private id_ex_register: IDEX_Register;
  private ex_mem_register: EXMEM_Register;
  private mem_wb_register: MEMWB_Register;

  constructor(program: any[], dataMemory: any[], availableMemSize: number) {
    this.program = program.filter((sc) => sc.kind === "SrcInstruction");
    this.registers = new RegistersFile();
    this.dataMemory = new DataMemory(program.length * 4, dataMemory.length, availableMemSize);
    this.dataMemory.uploadProgram(dataMemory);
    this.controlUnit = new ControlUnit();
    this.immediateUnit = new ImmediateUnit();
    this.alu = new ProcessorALU();
    this.forwardingUnit = new ForwardingUnit();
     this.hazardDetectionUnit = new HazardDetectionUnit();
     this.branchUnit = new BranchUnit(); 

    this.if_id_register = { instruction: NOP_DATA.instruction, PC: -1, PCP4: 0 };
    this.id_ex_register = { ...NOP_DATA };
    this.ex_mem_register = { ...NOP_DATA };
    this.mem_wb_register = { ...NOP_DATA };



     const spAbsoluteAddress = this.dataMemory.availableSpInitialAddress;
    this.registers.writeRegister("x2", intToBinary(spAbsoluteAddress));
  }

  public cycle(): PipelineCycleResult {
    this.clockCycles++;
    console.log(`\n--- [Pipeline CPU] Clock Cycle: ${this.clockCycles} ---`);


    const forwardingSignals = this.forwardingUnit.detect(
      this.id_ex_register.rs1,
      this.id_ex_register.rs2,
      this.ex_mem_register.RD,
      this.ex_mem_register.RUWr,
      this.mem_wb_register.RD,
      this.mem_wb_register.RUWr
    );

    const stallNeeded = this.hazardDetectionUnit.detect(
      this.id_ex_register.RUDataWrSrc, // Is the instruction in EX a Load?
      this.id_ex_register.RD,          // ¿A qué registro escribe?
      this.if_id_register.instruction?.rs1?.regeq.substring(1) || "X", // What register does the instruction read at ID?
      this.if_id_register.instruction?.rs2?.regeq.substring(1) || "X"
    );

    const { writeAction, wbState } = this.executeWB();
    const newState_MEM_WB = this.executeMEM();
    const { newState: newState_EX_MEM, branchDecision } = this.executeEX(forwardingSignals);
    const newState_ID_EX = this.executeID();
    const { newState_IF_ID, nextPC } = this.executeIF();

     
    let finalNextPC = nextPC;
    let final_newState_ID_EX = newState_ID_EX;
    let final_newState_IF_ID = newState_IF_ID;

     if (branchDecision.taken) {
      console.log(`[Pipeline] BRANCH TAKEN! Updating PC and flushing IF/ID stages.`);
      finalNextPC = parseInt(branchDecision.targetAddress, 2);
      
      final_newState_ID_EX = { ...NOP_DATA };
      final_newState_IF_ID = {instruction: NOP_DATA.instruction, PC: -1, PCP4: 0 };
    }

    if (stallNeeded) {
      // Inject a bubble (NOP) into the EX stage.
      this.id_ex_register = { ...NOP_DATA };
      this.mem_wb_register = newState_MEM_WB;
      this.ex_mem_register = newState_EX_MEM;
    } else {
       this.mem_wb_register = newState_MEM_WB;
      this.ex_mem_register = newState_EX_MEM;
      this.id_ex_register = final_newState_ID_EX;
      this.if_id_register = final_newState_IF_ID;
      this.pc = finalNextPC;
    }

    writeAction();

    return {
      IF: this.if_id_register,
      ID: this.id_ex_register,
      EX: this.ex_mem_register,
      MEM: this.mem_wb_register,
      WB: wbState, 
    };
  }



  private executeIF(): { newState_IF_ID: any; nextPC: number } {
    const PC_fe = this.pc;
    let instruction: any = null;
    if (PC_fe / 4 < this.program.length) {
      instruction = this.program[PC_fe / 4];
    }

     if (!instruction) {
      instruction = NOP_DATA.instruction;
    }

    const PCP4 = PC_fe + 4;

    const newState_IF_ID = { instruction, PC: PC_fe, PCP4 };
    console.log(
      `[IF Stage] Fetching PC=${PC_fe}. Instruction: "${instruction?.asm || "STALL/END"}"`
    );

    return { newState_IF_ID, nextPC: PC_fe + 4 };
  }

  private executeID(): IDEX_Register {
    const { instruction, PC, PCP4 } = this.if_id_register;
    if (!instruction) {
      console.log("[ID Stage] NOP");
      return { ...NOP_DATA };
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

    const newState: IDEX_Register = {
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
      DMCtrl: instruction.pc === -1 ? "XXX" : getFunct3(instruction),
      RUrs1,
      RUrs2,
      ImmExt,
      ImmSRC: controls.imm_src, 
      RD: instruction.rd ? instruction.rd.regeq.substring(1) : "X",
      rs1: instruction.rs1 ? instruction.rs1.regeq.substring(1) : "X",
      rs2: instruction.rs2 ? instruction.rs2.regeq.substring(1) : "X",
    };
    console.log(`[ID Stage] ID/EX Register OUT ->`, newState);
    return newState;
  }

 private executeEX(forwardingSignals: ForwardingSignals): { newState: EXMEM_Register, branchDecision: { taken: boolean, targetAddress: string } } {
    const {
      instruction,
      PC,
      PCP4,
      ALUASrc,
      ALUBSrc,
      ALUOp,
      BrOp,
      RUrs1,
      RUrs2,
      ImmExt,
      RD,
      rs1,
      rs2,
    } = this.id_ex_register;
    
    if (PC === -1) {
      console.log(`[EX Stage] NOP`);
      const nopState: EXMEM_Register = { 
        ...NOP_DATA, 
        ALUASrc: false, 
        ALUBSrc: false,
        ALUInputA: "X".padStart(32, "X"),
        ALUInputB: "X".padStart(32, "X"),
      };
      return { newState: nopState, branchDecision: { taken: false, targetAddress: "0" } };
    }
    console.log(`[EX Stage] Processing: "${instruction.asm}" (PC=${PC})`);

    let operandA = RUrs1;
    let operandB = RUrs2;
    let logA = "(from RUrs1)";
    let logB = "(from RUrs2)";

    switch (forwardingSignals.forwardA) {
      case ForwardingSource.FROM_MEM_STAGE:
        operandA = this.ex_mem_register.ALURes;
        logA = "(Forwarded from MEM)";
        break;
      case ForwardingSource.FROM_WB_STAGE:
        if (this.mem_wb_register.RUDataWrSrc === "01") {
          operandA = this.mem_wb_register.MemReadData;
        } else {
          operandA = this.mem_wb_register.ALURes;
        }
        logA = "(Forwarded from WB)";
        break;
    }

    switch (forwardingSignals.forwardB) {
      case ForwardingSource.FROM_MEM_STAGE:
        operandB = this.ex_mem_register.ALURes;
        logB = "(Forwarded from MEM)";
        break;
      case ForwardingSource.FROM_WB_STAGE:
        if (this.mem_wb_register.RUDataWrSrc === "01") {
          operandB = this.mem_wb_register.MemReadData;
        } else {
          operandB = this.mem_wb_register.ALURes;
        }
        logB = "(Forwarded from WB)";
        break;
    }

    const finalOperandA = ALUASrc ? PC.toString(2).padStart(32, "0") : operandA;
    const finalOperandB = ALUBSrc ? ImmExt : operandB;
    const finalLogA = ALUASrc ? "(from PC)" : logA;
    const finalLogB = ALUBSrc ? "(from ImmExt)" : logB;
    const ALURes = this.alu.execute(finalOperandA, finalOperandB, ALUOp);


     const isBranchOrJump = BrOp.substring(0, 2) === "01" || BrOp.substring(0, 2) === "10" || BrOp.substring(0, 2) === "11";
    
    const branchInput1 = isBranchOrJump ? operandA : "X".padStart(32, "X");
    const branchInput2 = isBranchOrJump ? operandB : "X".padStart(32, "X");

    const branchTaken = this.branchUnit.evaluate(BrOp, operandA, operandB);
    const branchResult = isBranchOrJump ? (branchTaken ? "1" : "0") : "X";

    console.log(`[EX Stage] Branch Unit decision for BrOp=${BrOp}: ${branchTaken ? 'TAKE BRANCH' : 'DO NOT TAKE'}`);

    console.log(`[EX Stage] Branch control signal received: BrOp=${BrOp}`);
    console.log(
      `[EX Stage] ALU Inputs:\n      Operand A: ${finalOperandA} ${finalLogA}\n      Operand B: ${finalOperandB} ${finalLogB}\n      ALU Op: ${ALUOp}`
    );
    console.log(`[EX Stage] ALU Result: ${ALURes}`);


     const newState: EXMEM_Register = {
      instruction, PC, PCP4,
      RUWr: this.id_ex_register.RUWr, 
      DMWr: this.id_ex_register.DMWr,
      RUDataWrSrc: this.id_ex_register.RUDataWrSrc, 
      DMCtrl: this.id_ex_register.DMCtrl,
      ALURes, 
      RUrs2: operandB, 
      RD: this.id_ex_register.RD,

      ALUASrc,
      ALUBSrc,
      ALUOp,
      ALUInputA: finalOperandA,
      ALUInputB: finalOperandB,

       BrOp,
      BranchInputRS1: branchInput1,
      BranchInputRS2: branchInput2,
      BranchResult: branchResult,
    };

    console.log(`[EX Stage] EX/MEM Register OUT ->`, newState);
    return { 
      newState: newState,
      branchDecision: {
        taken: branchTaken,
        targetAddress: ALURes 
      }
    };
  }
  

  private executeMEM(): MEMWB_Register {
    const { instruction, PC, PCP4, DMWr, DMCtrl, ALURes, RUrs2, RD } = this.ex_mem_register;
    if (instruction.pc === -1) {
      console.log(`[MEM Stage] NOP`);
      return { ...NOP_DATA };
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
          console.log("new MEMORY", this.getDataMemory());
        }
      } else {
        console.error(
          `[MEM Stage] Error: Dato para Store (RUrs2) no tiene el formato de 32 bits esperado.`
        );
      }
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

    const newState: MEMWB_Register = {
      instruction,
      PC,
      PCP4,
      RUWr: this.ex_mem_register.RUWr,
      RUDataWrSrc: this.ex_mem_register.RUDataWrSrc,
      ALURes,
      MemReadData: memReadData,
      RD,
    };
    console.log(`[MEM Stage] MEM/WB Register OUT ->`, newState);
    return newState;
  }

  private executeWB(): { writeAction: () => void; wbState: WB_Register } {
    const { instruction, PC, RUWr, RUDataWrSrc, ALURes, MemReadData, RD } =
      this.mem_wb_register;

    const defaultState: WB_Register = {
        instruction: NOP_DATA.instruction,
        RD: "X",
        dataToWrite: "X".padStart(32, "X"),
        RUWr: false,
    };

    if (instruction.pc === -1) {
      console.log(`[WB Stage] NOP`);
      return { writeAction: () => {}, wbState: defaultState };
    }
    console.log(`[WB Stage] Processing: "${instruction.asm}" (PC=${PC})`);

    let dataToWrite: string;
    switch (RUDataWrSrc) {
      case "00":
        dataToWrite = ALURes;
        break;
      case "01":
        dataToWrite = MemReadData;
        break;
      case "10":
        dataToWrite = (this.mem_wb_register.PCP4).toString(2).padStart(32, "0");
        break;
      default:
        dataToWrite = "X".padStart(32, "X");
        break;
    }

    const writeAction = () => {
      if (RUWr) {
        switch (RUDataWrSrc) {
          case "00": console.log(`[WB Stage] Data source: ALU Result (${dataToWrite})`); break;
          case "01": console.log(`[WB Stage] Data source: Memory Read Data (${dataToWrite})`); break;
          case "10": console.log(`[WB Stage] Data source: PC+4 (${dataToWrite})`); break;
          default: console.log(`[WB Stage] Data source: Unknown`); break;
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
    };

    const wbState: WB_Register = {
      instruction,
      RD,
      dataToWrite,
      RUWr,
    };

    return { writeAction, wbState };
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
