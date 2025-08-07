import { SCCPUResult } from "./singlecycle";

// Este es el "contrato" que todas nuestras CPUs (monociclo, segmentado) deben cumplir.
export interface ICPU {
  getPC(): number;
  currentInstruction(): any;
  finished(): boolean;
  cycle(): SCCPUResult | any;
  jumpToInstruction(address: string): void;
  nextInstruction(): void;
  getRegisterFile(): any;
  getDataMemory(): any;
  replaceDataMemory(newMemory: any[]): void;
  replaceRegisters(newRegisters: string[]): void;
}