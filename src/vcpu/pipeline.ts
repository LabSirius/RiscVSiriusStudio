import { ICPU } from "./interface";
import { RegistersFile, DataMemory } from "./components/components";

/**
 * Defines the structure of the data that is passed from the
 * Instruction Fetch (IF) stage to the Instruction Decode (ID) stage.
 * Corresponds to the inputs of the DecodeStage module in Verilog.
 */
interface IFID_Register {
  instruction: any; // Corresponds to Inst_fe
  pc: number; // Corresponds to PC_fe
  pc_plus_4: number; // Corresponds to PCP4_fe
}

interface IDEX_Register {
  // Control Signals
  ru_wr: boolean; // Write to Register Unit?
  alua_src: boolean; // MUX selector for ALU A input
  alub_src: boolean; // MUX selector for ALU B input
  dm_wr: boolean; // Write to Data Memory?
  ru_data_wr_src: number; // MUX selector for data to write back
  alu_op: string; // ALU operation type

  // Data
  pc: number;
  pc_plus_4: number;
  rs1_val: string; // Value from register rs1
  rs2_val: string; // Value from register rs2
  imm_ext: string; // Sign-extended immediate
  rd: string; // Destination register index
}

/**
 * The implementation of the Pipelined CPU.
 */
export class PipelineCPU implements ICPU {
  // --- Core Components ---
  private readonly program: any[];
  private dataMemory: DataMemory;
  private registers: RegistersFile;

  // --- Pipeline State ---
  private clockCycles: number = 0;

  // --- Global Wires/Signals ---
  private pc: number = 0; // This is the main PC register, corresponds to the input of FetchStage

  // --- Pipeline Registers ---
  private if_id_register: IFID_Register;
  private id_ex_register: IDEX_Register;

  constructor(program: any[], memory: any[], memSize: number) {
    this.program = program;
    this.registers = new RegistersFile();
    this.dataMemory = new DataMemory(program.length * 4, memory.length, memSize);
    this.dataMemory.uploadProgram(memory);

    // Initialize pipeline registers with default/NOP values
    this.if_id_register = { instruction: null, pc: 0, pc_plus_4: 0 };

    // We initialize the new record with NOP values (control signals in 0/false)
    this.id_ex_register = {
      ru_wr: false,
      alua_src: false,
      alub_src: false,
      dm_wr: false,
      ru_data_wr_src: 0,
      alu_op: "0000",
      pc: 0,
      pc_plus_4: 0,
      rs1_val: "0".padStart(32, "0"),
      rs2_val: "0".padStart(32, "0"),
      imm_ext: "0".padStart(32, "0"),
      rd: "00000",
    };
  }

  public cycle(): any {
    this.clockCycles++;
    console.log(`[Pipeline CPU] Clock Cycle: ${this.clockCycles}`);

    // this.executeWB();
    // this.executeMEM();
    // this.executeEX();
    
    this.executeID();

    this.executeIF();
  }

  // =================================================================
  //  Pipeline Stage Execution Methods
  // =================================================================

  /**
   * Instruction Fetch (IF) Stage.
   */
  private executeIF() {
    // Verilog wires for this stage
    const pc_fe = this.pc;
    let instruction: any;
    let pc_plus_4: number;

    // Module: InstMem - Fetches the instruction
    // Note: We check if pc_fe is within program bounds
    if (pc_fe / 4 < this.program.length) {
      instruction = this.program[pc_fe / 4];
    } else {
      instruction = null; // Represents fetching past the end of the program
    }

    // Module: Adder - Calculates PC + 4
    pc_plus_4 = pc_fe + 4;

    // Load the IF/ID pipeline register for the NEXT clock cycle
    this.if_id_register = { instruction, pc: pc_fe, pc_plus_4 };

    // Update the main PC for the NEXT clock cycle
    // In a real pipeline, a MUX would select between PC+4 and a branch address.
    // For now, it's always PC+4.
    this.pc = pc_plus_4;

    // --- Verification Log ---
    console.log(
      `[IF Stage] Reading from PC=${pc_fe}. Fetched Instr: "${
        instruction?.asm || "NOP"
      }". Next PC will be ${this.pc}.`
    );
  }

  /**
   * Instruction Decode (ID) Stage.
   * Decodes the instruction, reads from the register file, and generates control signals.
   */
  private executeID() {
    // 1. Read inputs from the IF/ID pipeline register
    const { instruction, pc, pc_plus_4 } = this.if_id_register;

    // If the instruction is null (from a bubble), pass NOP values forward
    if (!instruction) {
      this.id_ex_register = {
        // NOP values
        ru_wr: false,
        alua_src: false,
        alub_src: false,
        dm_wr: false,
        ru_data_wr_src: 0,
        alu_op: "0000",
        pc: 0,
        pc_plus_4: 0,
        rs1_val: "0".padStart(32, "0"),
        rs2_val: "0".padStart(32, "0"),
        imm_ext: "0".padStart(32, "0"),
        rd: "00000",
      };
      console.log("[ID Stage] NOP received. Passing NOP to EX.");
      return;
    }

    // 2. Decode instruction fields
    const opcode = instruction.opcode;
    const rd = instruction.rd.regeq.substring(1); // "x5" -> "5"
    const rs1 = instruction.rs1?.regeq; // e.g., "x1"
    const rs2 = instruction.rs2?.regeq; // e.g., "x2"

    // 3. Generate Control Signals (Simulating ControlUnit)
    let ru_wr = false,
      alua_src = false,
      alub_src = false,
      dm_wr = false;
    let ru_data_wr_src = 0;
    let alu_op = "0000"; // Default to ADD for now

    switch (opcode) {
      case "0110011": // R-type (e.g., add, sub)
        ru_wr = true;
        alua_src = false; // ALU A uses rs1
        alub_src = false; // ALU B uses rs2
        dm_wr = false;
        ru_data_wr_src = 2; // Result from ALU
        alu_op = "0010"; // R-type ALU op
        break;
      case "0010011": // I-type (e.g., addi)
        ru_wr = true;
        alua_src = false; // ALU A uses rs1
        alub_src = true; // ALU B uses Immediate
        dm_wr = false;
        ru_data_wr_src = 2; // Result from ALU
        alu_op = "0000"; // I-type ALU op
        break;
      // ... more cases will be added for lw, sw, beq, etc.
    }

    // 4. Read from Register File (Simulating RegUnit read)
    const rs1_val = rs1 ? this.registers.readRegisterFromName(rs1) : "0".padStart(32, "0");
    const rs2_val = rs2 ? this.registers.readRegisterFromName(rs2) : "0".padStart(32, "0");

    // 5. Generate Immediate (Simulating ImmUnit)
    // Simple I-type immediate for now
    const imm12 = instruction.encoding?.imm12 || "0";
    const imm_ext = imm12.padStart(32, imm12.charAt(0));

    // 6. Load the ID/EX pipeline register for the NEXT clock cycle
    this.id_ex_register = {
      ru_wr,
      alua_src,
      alub_src,
      dm_wr,
      ru_data_wr_src,
      alu_op,
      pc,
      pc_plus_4,
      rs1_val,
      rs2_val,
      imm_ext,
      rd,
    };

    // --- Verification Log ---
    console.log(
      `[ID Stage] Decoded Instr: "${
        instruction.asm
      }". Control Signals (RUWr=${ru_wr}, ALUSrcB=${alub_src}). Read rs1=${rs1_val.substring(
        28
      )}, rs2=${rs2_val.substring(28)}.`
    );
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
    this.dataMemory.uploadProgram(newMemory);
  }
  public replaceRegisters(newRegisters: string[]): void {
    (this.registers as any).registers = newRegisters;
  }
}
