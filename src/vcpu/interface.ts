// Este es el "contrato" que todas nuestras CPUs (monociclo, segmentado) deben cumplir.
// The Datapath view (MonocycleWires / PipelineStages) is deliberately absent: it
// is a per-CPU render concern reached through a concrete CPU reference, never
// through this shared contract (ADR-0003).
export interface ICPU {
  getPC(): number;
  currentInstruction(): any;
  finished(): boolean;
  cycle(): any;
  jumpToInstruction(address: string): void;
  nextInstruction(): void;
  getRegisterFile(): any;
  getDataMemory(): any;
  replaceDataMemory(newMemory: any[]): void;
  replaceRegisters(newRegisters: string[]): void;
  getProgram(): any[];

}