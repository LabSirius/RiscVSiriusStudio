
import { ICPU } from "./interface";
import { RegistersFile, DataMemory } from "./components"; 

export class PipelineCPU implements ICPU {
  private readonly program: any[];
  private dataMemory: DataMemory;
  private registers: RegistersFile;

  private clockCycles: number = 0;

  constructor(program: any[], memory: any[], memSize: number) {
    this.program = program;
    this.registers = new RegistersFile();
    this.dataMemory = new DataMemory(program.length * 4, memory.length, memSize);
    this.dataMemory.uploadProgram(memory);
  }

  public cycle(): any {
    this.clockCycles++;
    console.log(`[Pipeline CPU] Clock Cycle: ${this.clockCycles}`);
    // this.executeWB();
    // this.executeMEM();
    // this.executeEX();
    // this.executeID();
    // this.executeIF();
  }
  
  public getDataMemory(): DataMemory { return this.dataMemory; }
  public getRegisterFile(): RegistersFile { return this.registers; }
  public getPC = () => 0;
  public currentInstruction = () => ({});
  public finished = () => false;
  public jumpToInstruction = (address: string) => {};
  public nextInstruction = () => {};
  public replaceDataMemory = (newMemory: any[]) => {};
  public replaceRegisters = (newRegisters: string[]) => {};
}