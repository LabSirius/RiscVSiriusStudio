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

  RUDataWrSrc: "XX",
  ALUOp: "XXXXX",
  BrOp: "XXXXX",
  BranchInputRS1: "X".padStart(32, "X"),
  BranchInputRS2: "X".padStart(32, "X"),
  BranchResult: "0",
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

  DMWr: false,
  DMCtrl: "XXX",
  MemReadData: "X".padStart(32, "X"),
  Address: "X".padStart(32, "X"),
  MemWriteData: "X".padStart(32, "X"),

  Opcode: "XXXXXXX",
  Funct3: "XXX",
  Funct7: "XXXXXXX",

  HazardMessage: undefined,
};

const EMPTY_DATA = {
  ...NOP_DATA,
  instruction: { asm: "-", pc: -1 },
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

  Opcode: string;
  Funct3: string;
  Funct7: string;
  HazardMessage?: string;
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

  HazardMessage?: string;
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

  Address: string;
  MemWriteData: string;
  DMWr: boolean;
  DMCtrl: string;

  HazardMessage?: string;
}

interface WB_Register {
  instruction: any;
  PC: number;
  RD: string;
  dataToWrite: string;
  RUWr: boolean;
  RUDataWrSrc: string;

  HazardMessage?: string;
}

export type PipelineCycleResult = {
  IF: { instruction: any; PC: number; PCP4: number; HazardMessage?: string };
  ID: IDEX_Register;
  EX: EXMEM_Register;
  MEM: MEMWB_Register;
  WB: WB_Register;
};

export class PipelineCPU implements ICPU {
  private executionFinished: boolean = false;
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

  private if_id_register: { instruction: any; PC: number; PCP4: number; HazardMessage?: string };
  private id_ex_register: IDEX_Register;
  private ex_mem_register: EXMEM_Register;
  private mem_wb_register: MEMWB_Register;

  constructor(
    program: any[],
    programMemory: any[],
    writableDirectives: any[],
    readOnlyDirectives: any[],
    availableMemSize: number
  ) {
    this.program = program.filter((sc) => sc.kind === "SrcInstruction");
    this.registers = new RegistersFile();
    this.dataMemory = new DataMemory(writableDirectives, readOnlyDirectives, availableMemSize);
    this.dataMemory.uploadProgram(programMemory);
    this.controlUnit = new ControlUnit();
    this.immediateUnit = new ImmediateUnit();
    this.alu = new ProcessorALU();
    this.forwardingUnit = new ForwardingUnit();
    this.hazardDetectionUnit = new HazardDetectionUnit();
    this.branchUnit = new BranchUnit();

    this.if_id_register = { instruction: EMPTY_DATA.instruction, PC: -1, PCP4: 0 };
    this.id_ex_register = { ...EMPTY_DATA };
    this.ex_mem_register = { ...EMPTY_DATA };
    this.mem_wb_register = { ...EMPTY_DATA };

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

    let stallHazardMessage: string | undefined = undefined;

    const loadUseStall = this.hazardDetectionUnit.detect(
      this.id_ex_register.RUDataWrSrc,
      this.id_ex_register.RD,
      this.if_id_register.instruction?.rs1?.regeq.substring(1) || "X",
      this.if_id_register.instruction?.rs2?.regeq.substring(1) || "X"
    );

    if (loadUseStall) {
      const stalledInstrAsm = this.if_id_register.instruction.asm;
      const stalledInstrPC = this.if_id_register.PC;
      const loadInstrAsm = this.id_ex_register.instruction.asm;
      const loadInstrPC = this.id_ex_register.PC;
      const targetReg = `x${this.id_ex_register.RD}`;
      stallHazardMessage = `**Load-Use Hazard**: The instruction (PC=${stalledInstrPC}) \`'${stalledInstrAsm}'\` is stalled. It depends on the result of (PC=${loadInstrPC}) \`'${loadInstrAsm}'\`, which won't be available from memory in time for register ${targetReg}. A bubble (NOP) is inserted.`;
    }

    let blindSpotStall = false;
    const instrInID = this.if_id_register.instruction;

    if (!loadUseStall && instrInID?.kind === "SrcInstruction" && instrInID.pc !== -1) {
      const rs1_id = instrInID.rs1?.regeq.substring(1) || "X";
      const rs2_id = instrInID.rs2?.regeq.substring(1) || "X";
      const instrInWB = this.mem_wb_register;

      if (
        instrInWB.RUWr &&
        instrInWB.RD !== "0" &&
        instrInWB.RD !== "X" &&
        (instrInWB.RD === rs1_id || instrInWB.RD === rs2_id)
      ) {
        blindSpotStall = true;
        const stalledInstrAsm = this.if_id_register.instruction.asm;
        const stalledInstrPC = this.if_id_register.PC;
        const writerInstrAsm = this.mem_wb_register.instruction.asm;
        const writerInstrPC = this.mem_wb_register.PC;
        stallHazardMessage = `**Data Hazard (ID/WB)**: Stalling (PC=${stalledInstrPC}) \`'${stalledInstrAsm}'\`. Its source register is being written by (PC=${writerInstrPC}) \`'${writerInstrAsm}'\` in the WB stage. Forwarding is not possible for this specific case, requiring a bubble (NOP).`;
      }
    }

    const stallNeeded = loadUseStall || blindSpotStall;

    const { writeAction, wbState } = this.executeWB();
    const newState_MEM_WB = this.executeMEM();
    const { newState: newState_EX_MEM, branchDecision } = this.executeEX(forwardingSignals);
    const newState_ID_EX = this.executeID();
    const { newState_IF_ID, nextPC } = this.executeIF();

    let finalNextPC = nextPC;
    let final_newState_ID_EX = newState_ID_EX;
    let final_newState_IF_ID = newState_IF_ID;

    if (branchDecision.taken) {
      const branchInstrAsm = this.id_ex_register.instruction.asm;
      const branchInstrPC = this.id_ex_register.PC;
      const targetAddress = parseInt(branchDecision.targetAddress, 2);

      const branchMessage = `**Control Hazard**: Branch (PC=${branchInstrPC}) \`'${branchInstrAsm}'\` was taken. Flushing incorrectly fetched instructions and redirecting PC to ${targetAddress}.`;
      finalNextPC = targetAddress;
      final_newState_ID_EX = { ...NOP_DATA, HazardMessage: branchMessage };
      final_newState_IF_ID = {
        instruction: NOP_DATA.instruction,
        PC: -1,
        PCP4: 0,
        HazardMessage: branchMessage,
      };
    }

    if (stallNeeded) {
      this.pc = this.pc;
      this.if_id_register = this.if_id_register;

      this.id_ex_register = { ...NOP_DATA, HazardMessage: stallHazardMessage };

      this.ex_mem_register = newState_EX_MEM;
      this.mem_wb_register = newState_MEM_WB;
    } else {
      this.pc = finalNextPC;
      this.if_id_register = final_newState_IF_ID;
      this.id_ex_register = final_newState_ID_EX;
      this.ex_mem_register = newState_EX_MEM;
      this.mem_wb_register = newState_MEM_WB;
    }

    const isFinished =
      this.if_id_register.instruction.pc === -1 &&
      this.id_ex_register.PC === -1 &&
      this.ex_mem_register.PC === -1 &&
      this.mem_wb_register.PC === -1;

    if (isFinished) {
      this.executionFinished = true;
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
      instruction = EMPTY_DATA.instruction;
    }

    const PCP4 = PC_fe + 4;

    const newState_IF_ID = { instruction, PC: PC_fe, PCP4 };
    console.log(`[IF Stage] Fetching PC=${PC_fe}. Instruction: "${instruction?.asm || "STALL/END"}"`);

    return { newState_IF_ID, nextPC: PC_fe + 4 };
  }

  private executeID(): IDEX_Register {
    const { instruction, PC, PCP4, HazardMessage } = this.if_id_register as any;

    if (!instruction) {
      console.log("[ID Stage] Empty");
      return { ...EMPTY_DATA, HazardMessage };
    }

    if (instruction.pc === -1) {
      if (instruction.asm === "NOP") {
        console.log("[ID Stage] NOP detected, propagating bubble.");
        const cleanNopData = {
          ...NOP_DATA,
          RUrs1: "0".padStart(32, "0"),
          RUrs2: "0".padStart(32, "0"),
          ImmExt: "0".padStart(32, "0"),
          HazardMessage,
        };
        return cleanNopData;
      } else {
        console.log("[ID Stage] Empty stage detected.");
        return { ...EMPTY_DATA, HazardMessage };
      }
    }

    console.log(`[ID Stage] Processing: "${instruction.asm}" (PC=${PC})`);
    const controls = this.controlUnit.generate(instruction);
    const ImmExt = this.immediateUnit.generate(instruction);
    const rs1Addr = instruction.rs1?.regeq;
    const rs2Addr = instruction.rs2?.regeq;
    const RUrs1 = rs1Addr ? this.registers.readRegisterFromName(rs1Addr) : "X".padStart(32, "X");
    const RUrs2 = rs2Addr ? this.registers.readRegisterFromName(rs2Addr) : "X".padStart(32, "X");

    const opcode = instruction.opcode ?? "XXXXXXX";
    const funct3 = instruction.encoding?.funct3 ?? "XXX";
    const funct7 = instruction.encoding?.funct7 ?? "XXXXXXX";

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
      Opcode: opcode,
      Funct3: funct3,
      Funct7: funct7,
      HazardMessage: HazardMessage,
    };
    console.log(`[ID Stage] ID/EX Register OUT ->`, newState);
    return newState;
  }

  private executeEX(forwardingSignals: ForwardingSignals): {
    newState: EXMEM_Register;
    branchDecision: { taken: boolean; targetAddress: string };
  } {
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
      HazardMessage,
    } = this.id_ex_register;

    if (PC === -1) {
      const emptyOrNopData = instruction.asm === "NOP" ? NOP_DATA : EMPTY_DATA;
      console.log(`[EX Stage] ${emptyOrNopData.instruction.asm}`);
      const resultState: EXMEM_Register = {
        ...emptyOrNopData,
        ALUASrc: false,
        ALUBSrc: false,
        ALUInputA: "X".padStart(32, "X"),
        ALUInputB: "X".padStart(32, "X"),
        HazardMessage,
      };
      return { newState: resultState, branchDecision: { taken: false, targetAddress: "0" } };
    }

    let operandA = RUrs1;
    let operandB = RUrs2;
    const hazardMessages: string[] = [];

    switch (forwardingSignals.forwardA) {
      case ForwardingSource.FROM_MEM_STAGE:
        operandA = this.ex_mem_register.ALURes;
        hazardMessages.push(
          `**Data Hazard on rs1 (x${rs1})**: Forwarding result from (PC=${this.ex_mem_register.PC}) \`'${this.ex_mem_register.instruction.asm}'\` (MEM stage).`
        );
        break;
      case ForwardingSource.FROM_WB_STAGE:
        if (this.mem_wb_register.RUDataWrSrc === "01") {
          operandA = this.mem_wb_register.MemReadData;
        } else {
          operandA = this.mem_wb_register.ALURes;
        }
        hazardMessages.push(
          `**Data Hazard on rs1 (x${rs1})**: Forwarding result from (PC=${this.mem_wb_register.PC}) \`'${this.mem_wb_register.instruction.asm}'\` (WB stage).`
        );
        break;
    }

    switch (forwardingSignals.forwardB) {
      case ForwardingSource.FROM_MEM_STAGE:
        operandB = this.ex_mem_register.ALURes;
        hazardMessages.push(
          `**Data Hazard on rs2 (x${rs2})**: Forwarding result from (PC=${this.ex_mem_register.PC}) \`'${this.ex_mem_register.instruction.asm}'\` (MEM stage).`
        );
        break;
      case ForwardingSource.FROM_WB_STAGE:
        if (this.mem_wb_register.RUDataWrSrc === "01") {
          operandB = this.mem_wb_register.MemReadData;
        } else {
          operandB = this.mem_wb_register.ALURes;
        }
        hazardMessages.push(
          `**Data Hazard on rs2 (x${rs2})**: Forwarding result from (PC=${this.mem_wb_register.PC}) \`'${this.mem_wb_register.instruction.asm}'\` (WB stage).`
        );
        break;
    }

    const finalOperandA = ALUASrc ? intToBinary(PC) : operandA;
    const finalOperandB = ALUBSrc ? ImmExt : operandB;
    const ALURes = this.alu.execute(finalOperandA, finalOperandB, ALUOp);

    const isBranchOrJump = BrOp.substring(0, 1) === "1" || BrOp.substring(0, 2) === "01";

    const branchInput1 = isBranchOrJump ? operandA : "X".padStart(32, "X");
    const branchInput2 = isBranchOrJump ? operandB : "X".padStart(32, "X");

    const branchTaken = this.branchUnit.evaluate(BrOp, operandA, operandB);
    const branchResult = isBranchOrJump ? (branchTaken ? "1" : "0") : "X";

    const newState: EXMEM_Register = {
      instruction,
      PC,
      PCP4,
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
      HazardMessage: hazardMessages.length > 0 ? hazardMessages.join(" | ") : undefined,
    };

    return {
      newState: newState,
      branchDecision: {
        taken: branchTaken,
        targetAddress: ALURes,
      },
    };
  }

  private executeMEM(): MEMWB_Register {
    const { instruction, PC, PCP4, DMWr, DMCtrl, ALURes, RUrs2, RD, HazardMessage } =
      this.ex_mem_register;
    if (instruction.pc === -1) {
      const emptyOrNopData = instruction.asm === "NOP" ? NOP_DATA : EMPTY_DATA;
      console.log(`[MEM Stage] ${emptyOrNopData.instruction.asm}`);
      return { ...emptyOrNopData, DMWr: false, RUWr: false, HazardMessage };
    }
    console.log(`[MEM Stage] Processing: "${instruction.asm}" (PC=${PC})`);
    const address = parseInt(ALURes, 2);
    let memReadData = "X".padStart(32, "X");
    if (DMWr) {
      const chunks = RUrs2.match(/.{1,8}/g) || [];
      if (chunks[2] && chunks[3]) {
        let bytesToWrite: string[] = [];
        switch (DMCtrl) {
          case "000": // sb
            bytesToWrite = [chunks[3]];
            break;
          case "001": // sh
            bytesToWrite = [chunks[2], chunks[3]];
            break;
          case "010": // sw
            bytesToWrite = chunks;
            break;
        }
        if (bytesToWrite.length > 0) {
          this.dataMemory.write(bytesToWrite.reverse(), address);
        }
      }
    } else if (this.ex_mem_register.RUDataWrSrc === "01") {
      switch (DMCtrl) {
        case "000": { // lb
          const val = this.dataMemory.read(address, 1).join("");
          memReadData = val.padStart(32, val.charAt(0));
          break;
        }
        case "001": { // lh
          const val = this.dataMemory.read(address, 2).join("");
          memReadData = val.padStart(32, val.charAt(0));
          break;
        }
        case "010": // lw
          memReadData = this.dataMemory.read(address, 4).join("");
          break;
        case "100": // lbu
          memReadData = this.dataMemory.read(address, 1).join("").padStart(32, "0");
          break;
        case "101": // lhu
          memReadData = this.dataMemory.read(address, 2).join("").padStart(32, "0");
          break;
      }
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
      Address: ALURes,
      MemWriteData: DMWr ? RUrs2 : "X".padStart(32, "X"),
      DMWr,
      DMCtrl,
      HazardMessage: undefined,
    };
    return newState;
  }

  private executeWB(): { writeAction: () => void; wbState: WB_Register } {
    const { instruction, PC, RUWr, RUDataWrSrc, ALURes, MemReadData, RD, HazardMessage } =
      this.mem_wb_register;
      
    const emptyOrNopData = instruction.asm === "NOP" ? NOP_DATA : EMPTY_DATA;
    const defaultState: WB_Register = {
      instruction: emptyOrNopData.instruction,
      PC: -1,
      RD: "X",
      dataToWrite: "X".padStart(32, "X"),
      RUWr: false,
      RUDataWrSrc: "XX",
      HazardMessage,
    };

    if (instruction.pc === -1) {
      console.log(`[WB Stage] ${emptyOrNopData.instruction.asm}`);
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
        dataToWrite = intToBinary(this.mem_wb_register.PCP4);
        break;
      default:
        dataToWrite = "X".padStart(32, "X");
        break;
    }

    const writeAction = () => {
      if (RUWr && RD !== "0" && RD !== "X") {
        this.registers.writeRegister(`x${RD}`, dataToWrite);
      }
    };

    const wbState: WB_Register = {
      instruction,
      PC,
      RD,
      dataToWrite,
      RUWr,
      RUDataWrSrc,
      HazardMessage: undefined,
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
    return this.executionFinished;
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
    (this.dataMemory as any).memory_available = flatMemory;
  }
  public replaceRegisters(newRegisters: string[]): void {
    (this.registers as any).registers = newRegisters;
  }
}