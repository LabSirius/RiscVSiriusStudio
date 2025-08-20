/* eslint-disable @typescript-eslint/naming-convention */

import { RVDocument } from "./rvDocument";
import { RVContext } from "./support/context";
import { SCCPU, SCCPUResult } from "./vcpu/singlecycle";
import { branchesOrJumps, getFunct3, readsDM, writesDM, writesRU } from "./utilities/instructions";
import { intToBinary } from "./utilities/conversions";
import { window, commands, TextEditorDecorationType, Webview, Disposable } from "vscode";
import { PipelineCPU } from "./vcpu/pipeline";
import { ICPU } from "./vcpu/interface";

export type SimulationParameters = { memorySize: number };
export interface StepResult {
  instruction: any;
  result: SCCPUResult | {}; // Allow result to be an empty object for pipeline
}

/**
 * Base class for all simulators: contains common logic
 * related to execution, memory, and registers.
 */
export abstract class Simulator {
  // --- Properties ---
  protected readonly context: RVContext;
  protected readonly rvDoc: RVDocument;
  public readonly cpu: ICPU;
  protected readonly webview: Webview;
  private _configured: boolean = false;
  protected readonly simulatorType: "monocycle" | "pipeline";

  constructor(
    simulatorType: "monocycle" | "pipeline",
    params: SimulationParameters,
    rvDoc: RVDocument,
    context: RVContext,
    webview: Webview
  ) {
    this.context = context;
    this.rvDoc = rvDoc;
    this.webview = webview;
    this.simulatorType = simulatorType;

    if (!rvDoc.ir) {
      throw new Error("RVDocument has no IR");
    }
    if (simulatorType === "pipeline") {
      this.cpu = new PipelineCPU(rvDoc.ir.instructions, rvDoc.ir.memory, params.memorySize);
    } else {
      this.cpu = new SCCPU(rvDoc.ir.instructions, rvDoc.ir.memory, params.memorySize);
    }
  }

  // --- Public Methods ---
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
    const result = this.cpu.cycle();
    const instruction = this.cpu.currentInstruction();

    return { instruction, result };
  }

  public stop(): void {
    console.log("Simulator stopped");
  }

  public finished(): void {
    this.stop();
  }

  public resizeMemory(newSize: number): void {
    if (this.configured) throw new Error("Cannot resize memory after configuration");
    this.cpu.getDataMemory().resize(newSize);
    this.cpu.getRegisterFile().writeRegister("x2", intToBinary(newSize));
  }

  public replaceMemory(newMemory: string[]): void {
    this.cpu.replaceDataMemory(newMemory);
  }
  public replaceRegisters(newRegisters: string[]): void {
    this.cpu.replaceRegisters(newRegisters);
  }

  protected sendToWebview(msg: any) {
    this.webview.postMessage({ from: "extension", ...msg });
  }

  public abstract notifyRegisterWrite(register: string, value: string): void;
  public abstract notifyMemoryRead(address: number, length: number): void;
  public abstract notifyMemoryWrite(address: number, value: string, length: number): void;
  public abstract animateLine(line: number): void;
  public abstract sendSimulatorTypeToView(simulatorType: string): void;
  public abstract sendTextProgramToView(textProgram: string): void;
  public abstract makeEditorWritable(): Promise<void>;
}

/**
 * Text simulator: handles all the visual logic
 * based on the editor and textual webview.
 */
export class TextSimulator extends Simulator {
  // --- Properties ---
  private currentHighlight: TextEditorDecorationType | undefined;
  private selectionListenerDisposable: Disposable | undefined;

  constructor(
    simulatorType: "monocycle" | "pipeline",
    settings: SimulationParameters,
    rvDoc: RVDocument,
    context: RVContext,
    webview: Webview
  ) {
    super(simulatorType, settings, rvDoc, context, webview);
  }

  // --- Public Override Methods ---
  public override async start(): Promise<void> {
    await this.makeEditorReadOnly();

    // The mainView check is now simplified because 'this.webview' is guaranteed to be the correct one
    this.listenToEditorClicks();
    const inst = this.cpu.currentInstruction();
    let line = this.rvDoc.getLineForIR(inst);
    if (line === undefined) {
      line = 0;
    }
    this.highlightLine(line);

    const addressLine =
      this.rvDoc.ir?.instructions.map((instr) => {
        const line = instr.location.start.line;
        const jump = branchesOrJumps(instr.type, instr.opcode) ? instr.encoding.imm13 : null;
        return { line, jump };
      }) || [];

    const asmList = this.rvDoc.ir?.instructions.map((instr) => instr.asm);



    this.webview.postMessage({
      from: "extension",
      operation: "uploadMemory",
      payload: {
        memory: this.cpu.getDataMemory().getAvailableMemory(),
        program: this.cpu.getDataMemory().getProgramMemory(),
        codeSize: this.cpu.getDataMemory().codeSize,
        constantsSize: this.cpu.getDataMemory().constantsSize,
        addressLine,
        symbols: this.rvDoc.ir?.symbols,
        asmList,
      },
      typeSimulator: this.simulatorType,
    });

    super.start();

    const spValue = this.cpu.getDataMemory().availableSpInitialAddress;
    this.webview.postMessage({
      // Use 'this.webview' directly
      from: "extension",
      operation: "setRegister",
      register: "x2",
      value: intToBinary(spValue),
    });
  }

  public override step(): StepResult {
    const stepResult = super.step();

    if (this.simulatorType === "monocycle") {
      const instruction = stepResult.instruction;
      const result = stepResult.result as SCCPUResult;

      if (!instruction || Object.keys(instruction).length === 0) {
        this.stop();
        return { instruction: {}, result: {} };
      }

      instruction.currentPc = this.cpu.getPC();

      if (writesRU(instruction.type, instruction.opcode)) {
        this.cpu.getRegisterFile().writeRegister(instruction.rd.regeq, result.wb.result);
        this.notifyRegisterWrite(instruction.rd.regeq, result.wb.result);
      }
      if (readsDM(instruction.type, instruction.opcode)) {
        this.notifyMemoryRead(parseInt(result.dm.address, 2), this.bytesToReadOrWrite(instruction));
      }
      if (writesDM(instruction.type, instruction.opcode)) {
        this.writeResult(instruction, result);
      }
      if (branchesOrJumps(instruction.type, instruction.opcode)) {
        this.cpu.jumpToInstruction(result.buMux.result);
      } else {
        this.cpu.nextInstruction();
      }

      this.updateTextUI(this.cpu.currentInstruction(), stepResult);

      const isEbreak =
        instruction.opcode === "1110011" &&
        getFunct3(instruction) === "000" &&
        instruction.encoding.imm12 === "000000000001";

      if (isEbreak) {
        this.stop();
      }

      return stepResult;
    } else {
      console.log("Pipeline step executed in TextSimulator.");
      return stepResult;
    }
  }

  public override stop(): void {
    super.stop();
    this.clearHighlight();
    this.makeEditorWritable();
    this.context.clearDecorations();
    // Dispose of the selection listener when the simulator stops
    if (this.selectionListenerDisposable) {
      this.selectionListenerDisposable.dispose();
      this.selectionListenerDisposable = undefined;
    }

    // No need for mainView check, 'this.webview' is used in sendToWebview
    commands.executeCommand("setContext", "ext.isSimulating", false);
    this.sendToWebview({ operation: "stop" });
  }

  // --- UI Notification and Helper Methods ---

  private updateTextUI(currentInst: any, result: StepResult) {
    let line: number | undefined;
    try {
      line = this.rvDoc.getLineForIR(currentInst);
    } catch {
      line = undefined;
      this.stop();
    }
    if (line !== undefined) this.highlightLine(line);
    this.webview.postMessage({
      from: "extension",
      operation: "step",
      newPc: this.cpu.getPC(),
      currentInst: result.instruction,
      result: result.result,
      lineDecorationNumber: line !== undefined ? line + 1 : -1,
    });
  }

  private bytesToReadOrWrite(instruction: any): number {
    const funct3 = getFunct3(instruction);
    switch (funct3) {
      case "000":
        return 1;
      case "001":
        return 2;
      case "010":
        return 4;
      case "100":
        return 1;
      case "101":
        return 2;
      default:
        throw new Error("Cannot deduce bytes to write from funct3");
    }
  }

  private writeResult(instruction: any, result: SCCPUResult): void {
    const bytesToWrite = this.bytesToReadOrWrite(instruction);
    const addressNum = parseInt(result.dm.address, 2);
    if (result.dm.dataWr.length < 32) result.dm.dataWr = result.dm.dataWr.padStart(32, "0");
    if (!this.cpu.getDataMemory().canWrite(bytesToWrite, addressNum)) {
      throw new Error(`Cannot write to address ${addressNum.toString(16)}.`);
    }
    this.notifyMemoryWrite(addressNum, result.dm.dataWr, bytesToWrite);
    const chunks = result.dm.dataWr.match(/.{1,8}/g) as string[];
    this.cpu.getDataMemory().write(chunks.reverse(), addressNum);
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

  public async makeEditorReadOnly() {
    const editor = this.rvDoc.editor;
    if (!editor) {
      return;
    }

    await window.showTextDocument(editor.document, editor.viewColumn);

    await commands.executeCommand("workbench.action.files.toggleActiveEditorReadonlyInSession");
  }

  public async makeEditorWritable() {
    const editor = this.rvDoc.editor;
    if (!editor) {
      return;
    }

    await commands.executeCommand("workbench.action.files.toggleActiveEditorReadonlyInSession");
  }

  private listenToEditorClicks() {
    if (this.selectionListenerDisposable) {
      // Already listening
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
      this.currentHighlight = undefined; // Set to undefined after disposing
    }
  }
}

/**
 * Graphic simulator: extends the text simulator.
 */
export class GraphicSimulator extends TextSimulator {
  constructor(
    simulatorType: "monocycle" | "pipeline",
    settings: SimulationParameters,
    rvDoc: RVDocument,
    context: RVContext,
    webview: Webview
  ) {
    super(simulatorType, settings, rvDoc, context, webview);
  }

  public override async start(): Promise<void> {
    await super.start(); // Calls TextSimulator's start, which now uses 'this.webview'

    // These methods now use the GraphicSimulator's 'this.webview' (inherited from Simulator)
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
