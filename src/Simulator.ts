import { RVDocument } from "./rvDocument";
import { RVContext } from "./support/context";
import { SCCPU, SCCPUResult } from "./vcpu/singlecycle";
import { branchesOrJumps, getFunct3, readsDM, writesDM, writesRU } from "./utilities/instructions";
import { intToBinary } from "./utilities/conversions";

import { window, commands, TextEditorDecorationType } from "vscode";

export type SimulationParameters = {
  memorySize: number;
};

export interface StepResult {
  instruction: any;
  result: SCCPUResult;
}

/**
 * Base class for all simulators: contains common logic
 * related to execution, memory, and registers.
 */
export abstract class Simulator {
  protected readonly context: RVContext;
  protected readonly rvDoc: RVDocument;
  protected readonly cpu: SCCPU;
  private _configured: boolean = false;

  constructor(params: SimulationParameters, rvDoc: RVDocument, context: RVContext) {
    this.context = context;
    this.rvDoc = rvDoc;

    if (!rvDoc.ir) {
      throw new Error("RVDocument has no IR");
    }

    this.cpu = new SCCPU(rvDoc.ir.instructions, rvDoc.ir.memory, params.memorySize);
  }

  public get configured(): boolean {
    return this._configured;
  }

  public start(): void {
    console.log("Simulator started");
  }

  public step(): StepResult {
    if (!this.configured) {
      this._configured = true;
    }

    const instruction = this.cpu.currentInstruction();
    instruction.currentPc = this.cpu.getPC();
    const result = this.cpu.executeInstruction();

    if (writesRU(instruction.type, instruction.opcode)) {
      this.cpu.getRegisterFile().writeRegister(instruction.rd.regeq, result.wb.result);
      this.notifyRegisterWrite(instruction.rd.regeq, result.wb.result);
    }

    if (readsDM(instruction.type, instruction.opcode)) {
      this.notifyMemoryRead(parseInt(result.dm.address, 2), this.bytesToReadOrWrite());
    }

    if (writesDM(instruction.type, instruction.opcode)) {
      this.writeResult(result);
    }

    if (branchesOrJumps(instruction.type, instruction.opcode)) {
      this.cpu.jumpToInstruction(result.buMux.result);
    } else {
      this.cpu.nextInstruction();
    }

    return {
      instruction,
      result,
    };
  }

  public stop(): void {
    console.log("Simulator stopped");
  }

  public finished(): void {
    this.stop();
  }

  public resizeMemory(newSize: number): void {
    if (this.configured) {
      throw new Error("Cannot resize memory after configuration");
    }

    this.cpu.getDataMemory().resize(newSize);
    this.cpu.getRegisterFile().writeRegister("x2", intToBinary(newSize));
  }

  public replaceMemory(newMemory: string[]): void {
    this.cpu.replaceDataMemory(newMemory);
  }

  public replaceRegisters(newRegisters: string[]): void {
    this.cpu.replaceRegisters(newRegisters);
  }

  private bytesToReadOrWrite(): number {
    const instruction = this.cpu.currentInstruction();
    const funct3 = getFunct3(instruction);

    switch (funct3) {
      case "000":
        return 1;
      case "001":
        return 2;
      case "010":
        return 4;
      default:
        throw new Error("Cannot deduce bytes to write from funct3");
    }
  }

  private writeResult(result: SCCPUResult): void {
    const instruction = this.cpu.currentInstruction();
    const bytesToWrite = this.bytesToReadOrWrite();
    const addressNum = parseInt(result.dm.address, 2);

    if (result.dm.dataWr.length < 32) {
      result.dm.dataWr = result.dm.dataWr.padStart(32, "0");
    }

    if (!this.cpu.getDataMemory().canWrite(bytesToWrite, addressNum)) {
      throw new Error(`Cannot write to address ${addressNum.toString(16)}.`);
    }

    this.notifyMemoryWrite(addressNum, result.dm.dataWr, bytesToWrite);

    const chunks = result.dm.dataWr.match(/.{1,8}/g) as string[];
    this.cpu.getDataMemory().write(chunks.reverse(), addressNum);
  }

  // Abstract methods that subclasses MUST implement

  public abstract notifyRegisterWrite(register: string, value: string): void;

  public abstract notifyMemoryRead(address: number, length: number): void;

  public abstract notifyMemoryWrite(address: number, value: string, length: number): void;

  public abstract animateLine(line: number): void;

  public abstract sendSimulatorTypeToView(simulatorType: string): void;

  public abstract sendTextProgramToView(textProgram: string): void;
}

/**
 * Text simulator: handles all the visual logic
 * based on the editor and textual webview.
 */
export class TextSimulator extends Simulator {
  private currentHighlight: TextEditorDecorationType | undefined;
  private selectionListenerDisposable: any;

  constructor(settings: SimulationParameters, rvDoc: RVDocument, context: RVContext) {
    super(settings, rvDoc, context);
  }

  public override start(): void {
    const mainView = this.context.mainWebviewView;
    if (!mainView) {
      return;
    }

    this.listenToEditorClicks();
    const inst = this.cpu.currentInstruction();
    let line = this.rvDoc.getLineForIR(inst);
    if( line === undefined) line = 0;
    this.highlightLine(line);

    const addressLine =
      this.rvDoc.ir?.instructions.map((instr) => {
        const line = instr.location.start.line;
        const jump = branchesOrJumps(instr.type, instr.opcode) ? instr.encoding.imm13 : null;
        return { line, jump };
      }) || [];



    const asmList = this.rvDoc.ir?.instructions.map(instr => instr.asm);


    mainView.postMessage({
      from: "extension",
      operation: "uploadMemory",
      payload: {
        memory: this.cpu.getDataMemory().getMemory(),
        codeSize: this.cpu.getDataMemory().codeSize,
        constantsSize: this.cpu.getDataMemory().constantsSize,
        addressLine,
        symbols: this.rvDoc.ir?.symbols,
        asmList // To export Memory
      },
    });

    this.makeEditorReadOnly();
    super.start();

    const spValue = this.cpu.getDataMemory().spInitialAddress;
    mainView.postMessage({
      from: "extension",
      operation: "setRegister",
      register: "x2",
      value: intToBinary(spValue),
    });

    this.highlightCurrentInstruction();
  }

  public override step(): StepResult {
    const result = super.step();

    const mainView = this.context.mainWebviewView;
    if (!mainView) {
      return result;
    }

    const inst = this.cpu.currentInstruction();

    let line: number | undefined;

    try {
      line = this.rvDoc.getLineForIR(inst);
    } catch {
      if (this instanceof GraphicSimulator) {
        line = undefined;
      } else {
        throw new Error("");
      }
    }

    if (line !== undefined) {
      this.highlightLine(line);
    }

    mainView.postMessage({
      from: "extension",
      operation: "step",
      newPc: this.cpu.getPC(),
      currentInst: result.instruction,
      result: result.result,
      lineDecorationNumber: line !== undefined ? line + 1 : -1,
    });

    return result;
  }

  public override stop(): void {
    super.stop();
    this.clearHighlight();
    this.makeEditorWritable();

    const mainView = this.context.mainWebviewView;
    if (mainView) {
      commands.executeCommand("setContext", "ext.isSimulating", false);
      mainView.postMessage({ from: "extension", operation: "stop" });
    }
  }

  public override animateLine(line: number): void {
    const editor = this.rvDoc.editor;
    if (!editor) {
      return;
    }

    const blink = window.createTextEditorDecorationType({
      isWholeLine: true,
      backgroundColor: "rgba(58, 108, 115, 0.3)",
    });

    const range = editor.document.lineAt(line - 1).range;
    let show = true;

    const intervalId = setInterval(() => {
      editor.setDecorations(blink, show ? [range] : []);
      show = !show;
    }, 250);

    setTimeout(() => {
      clearInterval(intervalId);
      editor.setDecorations(blink, []);
      blink.dispose();
    }, 1000);
  }

  public override sendSimulatorTypeToView(simulatorType: string): void {
    this.sendToWebview({
      operation: "simulatorType",
      simulatorType,
    });
  }

  public override sendTextProgramToView(textProgram: string): void {
    this.sendToWebview({
      operation: "textProgram",
      textProgram,
    });
  }

  public override notifyRegisterWrite(register: string, value: string): void {
    this.sendToWebview({
      operation: "setRegister",
      register,
      value,
    });
  }

  public override notifyMemoryRead(address: number, length: number): void {
    this.sendToWebview({
      operation: "readMemory",
      address,
      _length: length,
    });
  }

  public override notifyMemoryWrite(address: number, value: string, length: number): void {
    this.sendToWebview({
      operation: "writeMemory",
      address,
      value,
      _length: length,
    });
  }

  // Helper methods

  private makeEditorReadOnly() {
    commands.executeCommand("workbench.action.files.toggleActiveEditorReadonlyInSession");
  }

  private makeEditorWritable() {
    commands.executeCommand("workbench.action.files.toggleActiveEditorReadonlyInSession");
  }

  private listenToEditorClicks() {
    if (this.selectionListenerDisposable) {
      return;
    }

    this.selectionListenerDisposable = window.onDidChangeTextEditorSelection((event) => {
      const line = event.selections?.[0]?.active.line;
      if (line !== undefined) {
        this.sendToWebview({
          operation: "clickInLine",
          lineNumber: line + 1,
        });
      }
    });
  }

  private highlightCurrentInstruction() {
    const inst = this.cpu.currentInstruction();
    const line = this.rvDoc.getLineForIR(inst);
    this.sendToWebview({
      operation: "decorateLine",
      lineDecorationNumber: line !== undefined ? line + 1 : 0,
    });
  }

  private highlightLine(lineNumber: number): void {
    const editor = this.rvDoc.editor;
    if (editor) {
      if (this.currentHighlight) {
        this.currentHighlight.dispose();
      }

      this.currentHighlight = window.createTextEditorDecorationType({
        backgroundColor: "rgba(209, 227, 231, 0.5)", // Azul pastel
        isWholeLine: true,
      });

      const range = editor.document.lineAt(lineNumber).range;
      editor.revealRange(range);
      editor.setDecorations(this.currentHighlight, [{ range, hoverMessage: "Selected line" }]);
    }
  }

  private clearHighlight() {
    if (this.currentHighlight) {
      this.currentHighlight.dispose();
    }
  }

  protected sendToWebview(msg: any) {
    const view = this.context.mainWebviewView;
    if (!view) {
      throw new Error("Webview no disponible");
    }
    view.postMessage({ from: "extension", ...msg });
  }
}

/**
 * Graphic simulator: extends the text simulator,
 * but also sends additional information to the graphic Webview.
 */
export class GraphicSimulator extends TextSimulator {
  constructor(settings: SimulationParameters, rvDoc: RVDocument, context: RVContext) {
    super(settings, rvDoc, context);
  }

  public override start(): void {
    super.start();

    this.sendSimulatorTypeToView("graphic");
    this.sendTextProgramToView(this.rvDoc.getText());
  }

  public override sendSimulatorTypeToView(simulatorType: string): void {
    this.sendToWebview({
      operation: "simulatorType",
      simulatorType,
    });
  }

  public override sendTextProgramToView(textProgram: string): void {
    this.sendToWebview({
      operation: "textProgram",
      textProgram,
    });
  }
}
