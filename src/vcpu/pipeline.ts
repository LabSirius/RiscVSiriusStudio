
import { ICPU } from "./interface"; 

/**
 * Skeleton for the Pipelined CPU.
 * Implements the ICPU interface so the simulator can use it.
 * For now, most methods are empty or throw an error.
 */
export class PipelineCPU implements ICPU {
  
  constructor(program: any[], memory: any[], memSize: number) {
    console.log("CPU pipeline created!");
    // Here we will initialize pipeline registers, memory, etc.
  }

  /**
   * The "cycle" in the pipelined processor will advance all stages at once.
   */
  cycle(): any {
    console.log("Executing a cycle of the pipelined processor (Pipeline)...");
    // Main logic to advance IF, ID, EX, MEM, WB will go here
    return {}; // Return an empty object for now
  }
  

  getPC(): number {
    // We will return the PC of the IF stage
    return 0;
  }

  currentInstruction() {
    // This could return the instruction in the ID or IF stage
    return {};
  }

  finished(): boolean {
    // The simulation will end when the pipeline is empty
    return false;
  }
  
  jumpToInstruction(address: string): void {
    console.log(`PIPELINE: Jump to ${address} not implemented.`);
  }

  nextInstruction(): void {
    // This method no longer makes sense in the pipeline, PC is updated differently
  }

  getRegisterFile() {
    console.log("PIPELINE: getRegisterFile not implemented.");
    return null;
  }

  getDataMemory() {
    console.log("PIPELINE: getDataMemory not implemented.");
    return null;
  }

  replaceDataMemory(newMemory: any[]): void {
    console.log("PIPELINE: replaceDataMemory not implemented.");
  }

  replaceRegisters(newRegisters: string[]): void {
    console.log("PIPELINE: replaceRegisters not implemented.");
  }
}