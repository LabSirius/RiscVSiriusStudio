/* eslint-disable @typescript-eslint/naming-convention */

import { ICPU } from "./interface";
import { RegistersFile, DataMemory, ProcessorALU } from "./components/components";
import { ControlUnit, ImmediateUnit } from "./components/decoder";

/**
 * @interface IFID_Register
 * @description Defines the data structure passed from the IF to the ID stage.
 */
interface IFID_Register {
  instruction: any;
  pc: number;
  pc_plus_4: number;
}

/**
 * @interface IDEX_Register
 * @description Defines the data structure passed from the ID to the EX stage.
 */
interface IDEX_Register {
  // Control Signals
  ru_wr: boolean;
  alua_src: boolean;
  alub_src: boolean;
  dm_wr: boolean;
  ru_data_wr_src: string;
  alu_op: string;
  br_op: string;

  // Data Values
  pc: number;
  rs1Val: string;
  rs2Val: string;
  imm_ext: string;
  rd: string;
}


/**
 * @interface EXMEM_Register
 * @description Defines the data structure passed from the EX to the MEM stage.
 */
interface EXMEM_Register {
  // Control Signals to be passed to MEM and WB
  ru_wr: boolean;
  dm_wr: boolean;
  ru_data_wr_src: string;

  // Data Values
  alu_result: string;
  rs2Val: string; // Needed for store instructions in MEM stage
  rd: string;     // The destination register
}


/**
 * @class PipelineCPU
 * @description The implementation of the Pipelined CPU, containing pipeline registers and stage logic.
 */
export class PipelineCPU implements ICPU {
  // --- Core Components ---
  private readonly program: any[];
  private dataMemory: DataMemory;
  private registers: RegistersFile;
  private controlUnit: ControlUnit;
  private immediateUnit: ImmediateUnit;
  private alu: ProcessorALU;

  // --- Pipeline State ---
  private clockCycles: number = 0;
  private pc: number = 0;

  // --- Pipeline Registers ---
  private if_id_register: IFID_Register;
  private id_ex_register: IDEX_Register;
  private ex_mem_register: EXMEM_Register;

  constructor(program: any[], memory: any[], memSize: number) {
    this.program = program;

    // Initialize components
    this.registers = new RegistersFile();
    this.dataMemory = new DataMemory(program.length * 4, memory.length, memSize);
    this.dataMemory.uploadProgram(memory);
    this.controlUnit = new ControlUnit();
    this.immediateUnit = new ImmediateUnit();
    this.alu = new ProcessorALU();

    // Initialize pipeline registers with default/NOP values
    this.if_id_register = { instruction: null, pc: -4, pc_plus_4: 0 };
    this.id_ex_register = {
      ru_wr: false,
      alua_src: false,
      alub_src: false,
      dm_wr: false,
      ru_data_wr_src: "00",
      alu_op: "00000",
      br_op: "00000",
      pc: 0,
      rs1Val: "0".padStart(32, "0"),
      rs2Val: "0".padStart(32, "0"),
      imm_ext: "0".padStart(32, "0"),
      rd: "00000",
    };
    this.ex_mem_register = {
      ru_wr: false,
      dm_wr: false,
      ru_data_wr_src: "00",
      alu_result: "0".padStart(32, "0"),
      rs2Val: "0".padStart(32, "0"),
      rd: "00000",
    };
  }

  /**
   * @method cycle
   * @description Executes one full clock cycle, advancing each stage of the pipeline.
   */
  public cycle(): any {
    this.clockCycles++;
    console.log(`[Pipeline CPU] Clock Cycle: ${this.clockCycles}`);

    // this.executeWB();
    // this.executeMEM();
    this.executeEX();
    this.executeID();
    this.executeIF();
  }

  // =================================================================
  //  Pipeline Stage Execution Methods
  // =================================================================

  /**
   * @method executeIF
   * @description Instruction Fetch (IF) Stage.
   */
  private executeIF() {
    const pc_fe = this.pc;
    let instruction: any = null;
    if (pc_fe / 4 < this.program.length) {
      instruction = this.program[pc_fe / 4];
    }
    const pc_plus_4 = pc_fe + 4;
    this.if_id_register = { instruction, pc: pc_fe, pc_plus_4 };
    this.pc = pc_plus_4; // For now, PC always increments. Branching will change this.
    console.log(
      `[IF Stage] Reading from PC=${pc_fe}. Fetched Instr: "${
        instruction?.asm || "NOP"
      }". Next PC will be ${this.pc}.`
    );
  }

  /**
   * @method executeID
   * @description Instruction Decode (ID) Stage.
   */
  private executeID() {
    const { instruction, pc } = this.if_id_register;

    if (!instruction) {
      // If instruction is null, propagate a NOP (bubble)
      this.id_ex_register = {
        ru_wr: false,
        alua_src: false,
        alub_src: false,
        dm_wr: false,
        ru_data_wr_src: "00",
        alu_op: "00000",
        br_op: "00000",
        pc: 0,
        rs1Val: "0".padStart(32, "0"),
        rs2Val: "0".padStart(32, "0"),
        imm_ext: "0".padStart(32, "0"),
        rd: "00000",
      };
      console.log("[ID Stage] NOP received. Passing NOP to EX.");
      return;
    }

    // Use reusable components to get all decoded values
    const controls = this.controlUnit.generate(instruction);
    const imm_ext = this.immediateUnit.generate(instruction);

    // Read from register file
    const rs1Val = instruction.rs1
      ? this.registers.readRegisterFromName(instruction.rs1.regeq)
      : "0".padStart(32, "0");
    const rs2Val = instruction.rs2
      ? this.registers.readRegisterFromName(instruction.rs2.regeq)
      : "0".padStart(32, "0");
    const rd = instruction.rd ? instruction.rd.regeq.substring(1) : "0";

    // Load the ID/EX pipeline register
    this.id_ex_register = {
      ru_wr: controls.ru_wr,
      alua_src: controls.alua_src,
      alub_src: controls.alub_src,
      dm_wr: controls.dm_wr,
      ru_data_wr_src: controls.ru_data_wr_src,
      alu_op: controls.alu_op,
      br_op: controls.br_op,
      pc,
      rs1Val,
      rs2Val,
      imm_ext,
      rd,
    };

    console.log(`[ID Stage] Decoded Instr: "${instruction.asm}"`);
    console.log(`[ID Stage] Control Signals:
  ru_wr: ${controls.ru_wr},
  alua_src: ${controls.alua_src},
  alub_src: ${controls.alub_src},
  dm_wr: ${controls.dm_wr},
  ru_data_wr_src: ${controls.ru_data_wr_src},
  alu_op: ${controls.alu_op},
  br_op: ${controls.br_op}
`);
    console.log(`[ID Stage] Immediate Extended: ${imm_ext}`);
    console.log(`[ID Stage] rs1: ${instruction.rs1?.regeq || "NA"} -> ${rs1Val}`);
    console.log(`[ID Stage] rs2: ${instruction.rs2?.regeq || "NA"} -> ${rs2Val}`);
    console.log(`[ID Stage] rd: ${rd}`);
  }


  /**
   * @method executeEX
   * @description Execution (EX) Stage.
   */
  private executeEX() {
    // 1. Lee los datos del registro ID/EX
    const { alua_src, alub_src, alu_op, pc, rs1Val, rs2Val, imm_ext } = this.id_ex_register;
    
    console.log(`[EX Stage] Processing instruction from PC=${pc}`);
    
    // 2. Lógica de los MUX para las entradas de la ALU (como en MUXALUA y MUXALUB del Verilog)
    const operandA = alua_src ? pc.toString(2).padStart(32, '0') : rs1Val;
    const operandB = alub_src ? imm_ext : rs2Val;
    
    // 3. Ejecuta la operación de la ALU
    const aluResult = this.alu.execute(operandA, operandB, alu_op);
    
    // VERIFICACIÓN CON CONSOLE.LOG
    console.log(`[EX Stage] ALU Inputs: 
      Operand A (alua_src=${alua_src}): ${operandA}
      Operand B (alub_src=${alub_src}): ${operandB}
      ALU Op: ${alu_op}
    `);
    console.log(`[EX Stage] ALU Result: ${aluResult}`);

    // 4. Carga el registro EX/MEM para la siguiente etapa
    this.ex_mem_register = {
      ru_wr: this.id_ex_register.ru_wr,
      dm_wr: this.id_ex_register.dm_wr,
      ru_data_wr_src: this.id_ex_register.ru_data_wr_src,
      alu_result: aluResult,
      rs2Val: this.id_ex_register.rs2Val, // Pasamos rs2Val para las instrucciones store (SW, SB)
      rd: this.id_ex_register.rd,
    };

    console.log(`[EX Stage] EX/MEM Register loaded for next cycle.`);
  }

  // =================================================================
  //  ICPU Interface Methods
  // =================================================================

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
    this.dataMemory.uploadProgram(newMemory);
  }
  public replaceRegisters(newRegisters: string[]): void {
    (this.registers as any).registers = newRegisters;
  }
}
