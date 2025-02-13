import { window, EventEmitter, Event, TextEditor, workspace, TextEditorDecorationType } from "vscode";
import { RVDocument } from "./rvDocument";
import { RVContext } from "./support/context";
import { SCCPU, SCCPUResult } from "./vcpu/singlecycle";
import {
  branchesOrJumps,
  getFunct3,
  readsDM,
  usesRegister,
  writesDM,
  writesRU
} from "./utilities/instructions";

export class Simulator {
  protected context: RVContext;
  protected rvDoc: RVDocument;
  protected editor: TextEditor;
  protected cpu: SCCPU;

  private didStep: EventEmitter<void> = new EventEmitter<void>();
  public readonly onDidStep: Event<void> = this.didStep.event;

  private didStop: EventEmitter<void> = new EventEmitter<void>();
  public readonly onDidStop: Event<void> = this.didStop.event;

  constructor(
    program: any[],
    readonly memSize: number,
    spAddress: number,
    rvDoc: RVDocument,
    context: RVContext
  ) {
    this.context = context;
    this.rvDoc = rvDoc;
    const editor = rvDoc.getEditor();
    if (!editor) {
      throw new Error('Editor not found for document, should make one?');
    }
    this.editor = editor;
    this.cpu = new SCCPU(program, memSize, spAddress);
  }

  start(): void {
    console.log("Simulator start ", this.cpu.currentInstruction());

  }

  step(): void {
    console.log("Simulator step");
    if (this.cpu.finished()) {
      // this.sendToSimulator({
      //   operation: 'simulationFinished',
      //   title: 'Simulation finished',
      //   body: '..... Something ....'
      // });
      return;
    }
    const instruction = this.cpu.currentInstruction();
    const result = this.cpu.executeInstruction();

    // Send messages to update the registers view.
    if (writesRU(instruction.type, instruction.opcode)) {
      console.log('Writing result to RU ', result.wb.result);
      // this.sendToRegisters({
      //   operation: 'setRegister',
      //   register: instruction.rd.regeq,
      //   value: result.wb.result
      // });
      this.cpu
        .getRegisterFile()
        .writeRegister(instruction.rd.regeq, result.wb.result);
    }
    if (readsDM(instruction.type, instruction.opcode)) {
      // this.sendToDataMemory({
      //   operation: 'read',
      //   address: result.dm.address,
      //   bytes: this.bytesToReadOrWrite()
      // });
    }
    if (writesDM(instruction.type, instruction.opcode)) {
      this.writeResult(result);
    }
    // Send message to update the simulator components.
    // this.sendToSimulator({
    //   operation: 'setInstruction',
    //   instruction: instruction,
    //   result: result
    // });

    if (branchesOrJumps(instruction.type, instruction.opcode)) {
      this.cpu.jumpToInstruction(result.buMux.result);
    } else {
      this.cpu.nextInstruction();
    }

    this.didStep.fire();
  }

  stop(): void {
    console.log("Simulator stop");
    this.didStop.fire();
  }
  private bytesToReadOrWrite() {
    const instruction = this.cpu.currentInstruction();
    const funct3 = getFunct3(instruction);
    let bytes;
    switch (funct3) {
      case '000':
        bytes = 1;
        break;
      case '001':
        bytes = 2;
        break;
      case '010':
        bytes = 4;
        break;
      default:
        throw new Error('Cannot deduce bytes to write from funct3');
    }
    return bytes;
  }
  private writeResult(result: SCCPUResult) {
    const instruction = this.cpu.currentInstruction();
    let bytesToWrite = this.bytesToReadOrWrite();
    const addressNum = parseInt(result.dm.address, 2);
    if (!this.cpu.getDataMemory().canWrite(bytesToWrite, addressNum)) {
      // this.sendToSimulator({
      //   operation: 'simulationFinished',
      //   title: 'Simulation error',
      //   body: `Cannot write ${result.dm.dataWr
      //     } (${bytesToWrite} bytes) to memory address ${addressNum.toString(
      //       16
      //     )} last address is ${this.cpu
      //       .getDataMemory()
      //       .lastAddress()
      //       .toString(16)} `
      // });
    }
    // console.log(
    //   'Writing result to DM address: ',
    //   result.dm.address,
    //   ' value to write ',
    //   result.dm.dataWr,
    //   ' section to write ',
    //   bytesToWrite,
    //   ' can Write ',
    //   this.cpu.getDataMemory().canWrite(bytesToWrite, addressNum)
    // );
    // this.sendToDataMemory({
    //   operation: 'write',
    //   address: result.dm.address,
    //   value: result.dm.dataWr,
    //   bytes: bytesToWrite
    // });
    const chunks = result.dm.dataWr.match(/.{1,8}/g) as Array<string>;
    this.cpu.getDataMemory().write(chunks.reverse(), addressNum);
  }
  protected sendToMainView(message: any) {
    const view = this.context.mainWebviewView;
    if (!view) {
      throw new Error('Main view not found');
    }
    view.postMessage(message);
  }
}

export class TextSimulator extends Simulator {
  // Line highlighting
  private currentHighlight: TextEditorDecorationType | undefined;

  constructor(
    program: any[],
    readonly memSize: number,
    spAddress: number,
    rvDoc: RVDocument,
    context: RVContext
  ) {
    super(program, memSize, spAddress, rvDoc, context);
  }

  public start(): void {
    super.start();
    const currentInst = this.cpu.currentInstruction();
    const lineNumber = this.rvDoc.getLineForIR(currentInst);

    if (lineNumber !== undefined) {
      this.highlightLine(lineNumber);
    }
  }

  public step(): void {
    super.step();
    // Handle the visualization
    const currentInst = this.cpu.currentInstruction();
    const lineNumber = this.rvDoc.getLineForIR(currentInst);

    if (lineNumber !== undefined) {
      this.highlightLine(lineNumber);
    }
  }

  public stop(): void {
    super.stop();
    if (this.currentHighlight) {
      this.currentHighlight.dispose();
    }
  }

  private highlightLine(lineNumber: number): void {
    const editor = this.rvDoc.getEditor();
    if (editor) {
      // Clear previous highlight if it exists
      if (this.currentHighlight) {
        this.currentHighlight.dispose();
      }

      // Create and store new decoration type
      this.currentHighlight = window.createTextEditorDecorationType({
        backgroundColor: 'rgba(255, 255, 0, 0.2)',
        isWholeLine: true
      });

      const range = editor.document.lineAt(lineNumber).range;
      const decoration = {
        range: range,
        hoverMessage: 'Selected line'
      };
      editor.setDecorations(this.currentHighlight, [decoration]);
    }
  }
}

