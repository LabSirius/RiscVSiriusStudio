import { ICPU } from "./interface";
import { RegistersFile, DataMemory } from "./components";

/**
 * Defines the structure of the data that is passed from the
 * Instruction Fetch (IF) stage to the Instruction Decode (ID) stage.
 */
interface IFID_Register {
  instruction: any;    // The instruction fetched from memory
  pc_plus_4: number; // The value of PC + 4, for the next instruction
}

/**
 * The implementation of the Pipelined CPU.
 * It contains the pipeline registers and the logic for each of the 5 stages.
 */
export class PipelineCPU implements ICPU {
  // --- Core Components ---
  private readonly program: any[];
  private dataMemory: DataMemory;
  private registers: RegistersFile;

  // --- Pipeline State ---
  private clockCycles: number = 0;
  private pc: number = 0;

  // --- Pipeline Registers ---
  private if_id_register: IFID_Register;

  constructor(program: any[], memory: any[], memSize: number) {
    this.program = program;
    this.registers = new RegistersFile();
    this.dataMemory = new DataMemory(program.length * 4, memory.length, memSize);
    this.dataMemory.uploadProgram(memory);

    // Initialize pipeline registers with default/NOP values
    this.if_id_register = { instruction: null, pc_plus_4: 0 };
  }

  /**
   * Executes one full clock cycle, advancing each stage of the pipeline.
   * The execution order is reversed (WB to IF) to simulate the parallel
   * nature of hardware, preventing data from one stage from incorrectly
   * affecting the next stage in the same clock cycle.
   */
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
   * Fetches the instruction from memory and calculates the next PC.
   */
  private executeIF() {
    // 1. Fetch the instruction from the program memory using the PC.
    //    PC is a byte address, so we divide by 4 for the word-indexed array.
    const instruction = this.program[this.pc / 4];

    // 2. Calculate PC + 4 for the next sequential instruction.
    const pc_plus_4 = this.pc + 4;

    // 3. Load the IF/ID pipeline register with the values for the NEXT clock cycle.
    this.if_id_register = { instruction, pc_plus_4 };

    // 4. Update the PC for the NEXT clock cycle.
    this.pc = pc_plus_4;

    // --- Verification Log ---
    console.log(`[IF Stage] Fetched instruction: ${instruction?.asm || 'NOP'}, Next PC will be: ${this.pc}`);
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

  /**
   * Returns the current value of the Program Counter.
   */
  public getPC(): number {
    return this.pc;
  }

  /**
   * Returns the instruction currently being decoded (in the ID stage).
   * For now, it returns the last fetched instruction.
   */
  public currentInstruction(): any {
    return this.if_id_register.instruction || {};
  }

  /**
   * Determines if the simulation has finished.
   */
  public finished(): boolean {
    // TODO: Implement logic to check if the pipeline is empty.
    return false;
  }

  /**
   * Handles jumps and branches by modifying the PC.
   */
  public jumpToInstruction(address: string): void {
    // TODO: Implement jump logic for the pipeline (e.g., flushing).
    console.warn(`jumpToInstruction(${address}) not yet implemented for pipeline.`);
  }

  /**
   * This method is largely unused in the pipeline model, as PC updates
   * are handled by the IF stage and branch/jump logic.
   */
  public nextInstruction(): void {
    // Does nothing in the pipeline model.
  }

  public replaceDataMemory(newMemory: any[]): void {
    this.dataMemory.uploadProgram(newMemory);
  }

  public replaceRegisters(newRegisters: string[]): void {
    // This requires a more direct way to set registers, let's add it.
    (this.registers as any).registers = newRegisters;
  }
}