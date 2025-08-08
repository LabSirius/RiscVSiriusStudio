import { ICPU } from "./interface";
import { RegistersFile, DataMemory } from "./components";

/**
 * Defines the structure of the data that is passed from the
 * Instruction Fetch (IF) stage to the Instruction Decode (ID) stage.
 * Corresponds to the inputs of the DecodeStage module in Verilog.
 */
interface IFID_Register {
  instruction: any; // Corresponds to Inst_fe
  pc: number;       // Corresponds to PC_fe
  pc_plus_4: number; // Corresponds to PCP4_fe
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

  constructor(program: any[], memory: any[], memSize: number) {
    this.program = program;
    this.registers = new RegistersFile();
    this.dataMemory = new DataMemory(program.length * 4, memory.length, memSize);
    this.dataMemory.uploadProgram(memory);

    // Initialize pipeline registers with default/NOP values
    this.if_id_register = { instruction: null, pc: 0, pc_plus_4: 0 };
  }

  public cycle(): any {
    this.clockCycles++;
    console.log(`[Pipeline CPU] Clock Cycle: ${this.clockCycles}`);

    // this.executeWB();
    // this.executeMEM();
    // this.executeEX();
    // this.executeID();
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
    console.log(`[IF Stage] Reading from PC=${pc_fe}. Fetched Instr: "${instruction?.asm || 'NOP'}". Next PC will be ${this.pc}.`);
  }

  // ... el resto de la clase ...
  public getDataMemory(): DataMemory { return this.dataMemory; }
  public getRegisterFile(): RegistersFile { return this.registers; }
  public getPC(): number { return this.pc; }
  public currentInstruction(): any { return this.if_id_register.instruction || {}; }
  public finished(): boolean { return false; }
  public jumpToInstruction(address: string): void { console.warn(`jumpToInstruction(${address}) not yet implemented for pipeline.`); }
  public nextInstruction(): void { }
  public replaceDataMemory(newMemory: any[]): void { this.dataMemory.uploadProgram(newMemory); }
  public replaceRegisters(newRegisters: string[]): void { (this.registers as any).registers = newRegisters; }
}