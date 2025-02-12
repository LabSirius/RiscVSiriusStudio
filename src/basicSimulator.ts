import { RVDocument } from "./rvDocument";
import { RVContext } from "./support/context";
import { SCCPU } from "./vcpu/singlecycle";

export class BasicSimulator {
  private cpu: SCCPU;
  private _contetxt: RVContext;
  private _document: RVDocument;

  constructor(context: RVContext, document: RVDocument, memorySize: number = 128) {
    this._contetxt = context;
    this._document = document;
    if (!document.validIR()) {
      throw new Error('Document must have a valid IR be a RISC-V assembly file');
    }

    // Fixed values for the memorySize and the spAddress


    this.cpu = new SCCPU(document.ir?.instructions, momorySize, memorySize - 4);
    this.dataMemPanel = datamem;
    this.regPanel = registers;

    // Initialize views
    this.sendToDataMemory({ operation: 'showDataMemView' });
    this.sendToDataMemory({ operation: 'clearSelection' });
    this.sendToRegisters({ operation: 'clearSelection' });
    this.sendToRegisters({ operation: 'showRegistersView' });
  }

  private sendToRegisters(message: any) {
    this.regPanel.getWebView().postMessage(message);
  }

  private sendToDataMemory(message: any) {
    this.dataMemPanel.getWebView().postMessage(message);
  }

  public step() {
    if (!this.cpu.finished()) {
      // Execute current instruction
      const currentInst = this.cpu.currentInstruction();
      logger().info({ msg: 'Executing instruction', instruction: currentInst });

      // Move to next instruction
      this.cpu.nextInstruction();

      // Update views
      this.sendToRegisters({ operation: 'updateRegisters', data: this.cpu.getRegisters() });
      this.sendToDataMemory({ operation: 'updateMemory', data: this.cpu.getMemory() });
    }
  }

  public reset() {
    this.cpu = new SCCPU(this.cpu.getProgram(), this.cpu.getMemorySize(), this.cpu.getStackPointer());
    this.sendToRegisters({ operation: 'reset' });
    this.sendToDataMemory({ operation: 'reset' });
  }
}
