/* eslint-disable @typescript-eslint/naming-convention */

import { RVDocument } from "./rvDocument";
import { RVContext } from "./support/context";
import { defaultMonocycleWires, SCCPU, MonocycleWires } from "./vcpu/singlecycle";
import { DecodedInstruction } from "./vcpu/instruction";
import { intToBinary } from "./utilities/conversions";
import { window, commands, TextEditorDecorationType, Webview, Disposable } from "vscode";
import { PipelineCPU, PipelineStages } from "./vcpu/pipeline/pipeline";
import { ICPU } from "./vcpu/interface";
import { CycleEffect } from "./vcpu/cycle";

export type SimulationParameters = { memorySize: number };
export interface StepResult {
  instruction: any;
  effect: CycleEffect;
}

/** Builds a single-cycle CPU from an assembled document. */
function buildMonocycleCpu(rvDoc: RVDocument, params: SimulationParameters): SCCPU {
  if (!rvDoc.ir) {
    throw new Error("RVDocument has no IR");
  }
  return new SCCPU(
    rvDoc.ir.instructions,
    rvDoc.ir.programMemory,
    rvDoc.ir.writableMemory,
    rvDoc.ir.readOnlyMemory,
    params.memorySize
  );
}

/** Builds a pipeline CPU from an assembled document. */
function buildPipelineCpu(rvDoc: RVDocument, params: SimulationParameters): PipelineCPU {
  if (!rvDoc.ir) {
    throw new Error("RVDocument has no IR");
  }
  return new PipelineCPU(
    rvDoc.ir.instructions,
    rvDoc.ir.programMemory,
    rvDoc.ir.writableMemory,
    rvDoc.ir.readOnlyMemory,
    params.memorySize
  );
}

/**
 * Composition-root CPU factory: the one place that maps a simulator kind to its
 * concrete CPU. Callers that don't need the Datapath view (the text simulator)
 * hold the result as `ICPU`; the graphic simulator subclasses build the concrete
 * CPU directly so they keep a statically-typed reference (ADR-0003).
 */
export function createCpu(
  simulatorType: "monocycle" | "pipeline",
  params: SimulationParameters,
  rvDoc: RVDocument
): ICPU {
  return simulatorType === "pipeline"
    ? buildPipelineCpu(rvDoc, params)
    : buildMonocycleCpu(rvDoc, params);
}

/**
 * Base class for all simulators.
 */
export abstract class Simulator {
  protected readonly context: RVContext;
  protected readonly rvDoc: RVDocument;
  public readonly cpu: ICPU;
  protected readonly webview: Webview;
  private _configured: boolean = false;
  protected readonly simulatorType: "monocycle" | "pipeline";

  constructor(
    cpu: ICPU,
    simulatorType: "monocycle" | "pipeline",
    rvDoc: RVDocument,
    context: RVContext,
    webview: Webview
  ) {
    this.context = context;
    this.rvDoc = rvDoc;
    this.webview = webview;
    this.simulatorType = simulatorType;
    this.cpu = cpu;
  }

  public get configured(): boolean {
    return this._configured;
  }

  public start(options?: { isRestart?: boolean }): void {
    console.log("Simulator configured and ready. Waiting for webview signal...");
  }

  public abstract sendInitialData(options?: { isHardReset: boolean }): void;

  public step(): StepResult {
    if (!this.configured) {
      this._configured = true;
    }
    // Capture the executing instruction before cycle(): cycle() self-commits and
    // advances the PC, so afterwards currentInstruction() is the *next* one.
    const instruction = this.cpu.currentInstruction();
    const effect = this.cpu.cycle();
    return { instruction, effect };
  }

  public stop(options?: { sendStopMessage: boolean; isReset?: boolean }): void {
    console.log("Simulator stopped");
  }

  public finished(): void {
    this.stop({ sendStopMessage: true });
  }

  public resizeMemory(newSize: number): void {
    if (this.configured) throw new Error("Cannot resize memory after configuration");
    this.cpu.getDataMemory().resize(newSize);
    this.cpu.getRegisterFile().writeRegister("x2", intToBinary(newSize - 4));
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
  public abstract makeEditorReadOnly(): Promise<void>;
}

/**
 * Text simulator: handles visual logic for editor and textual webview.
 */
export class TextSimulator extends Simulator {
  private currentHighlight: TextEditorDecorationType | undefined;
  private selectionListenerDisposable: Disposable | undefined;

  constructor(
    cpu: ICPU,
    simulatorType: "monocycle" | "pipeline",
    rvDoc: RVDocument,
    context: RVContext,
    webview: Webview
  ) {
    super(cpu, simulatorType, rvDoc, context, webview);
  }

  /**
   * The datapath render payload posted to the webview each step. `cycle()` no
   * longer carries render data (it returns a Cycle effect — ADR-0002), and the
   * datapath view is off ICPU (ADR-0003), so the plain text simulator has no
   * datapath to source and posts an empty bundle. The graphic simulator
   * subclasses override this to source the real view from their concrete CPU's
   * `datapathView()`.
   */
  protected datapathPayload(_stepResult: StepResult): MonocycleWires | PipelineStages {
    return defaultMonocycleWires;
  }

  public override async start(options?: { isRestart?: boolean }): Promise<void> {
    if (!options?.isRestart) {
      await this.makeEditorReadOnly();
    }

    this.listenToEditorClicks();
    super.start(options);
  }

  public override sendInitialData(options?: { isHardReset: boolean }): void {
    const inst = this.cpu.currentInstruction();
    let line = this.rvDoc.getLineForIR(inst);
    if (line === undefined) {
      line = 0;
    }
    this.highlightLine(line);
    const addressLine =
      this.rvDoc.ir?.instructions.map((instr) => ({
        line: instr.location.start.line,
        jump: DecodedInstruction.from(instr).branchesOrJumps() ? instr.encoding.imm13 : null,
      })) || [];
    const asmList = this.rvDoc.ir?.instructions.map((instr) => instr.asm);

    const typesInstruction = this.cpu.getProgram().map((instr) => ({ type: instr.type }));


    const payload = {
      memory: this.cpu.getDataMemory().getAvailableMemory(),
      program: this.cpu.getDataMemory().getProgramMemory(),
      directivesWritableSize: this.cpu.getDataMemory().writableDirectives_size,
      directivesReadOnlySize: this.cpu.getDataMemory().readOnlyDirectives_size,

      addressLine,
      symbols: this.rvDoc.ir?.symbols,
      asmList,
    };
    try {
      this.webview.postMessage({
        from: "extension",
        operation: "uploadMemory",
        payload,
        typeSimulator: this.simulatorType,
        initialLine: inst.location?.start?.line ?? -1,
        isReset: options?.isHardReset ?? false,
        typesInstruction
      });
    } catch (error) {
      console.error(
        "Failed to post 'uploadMemory' message. Check payload for non-serializable data.",
        error
      );
      window.showErrorMessage(
        "Failed to send initial data to simulator. See extension logs for details."
      );
    }
    const spValue = this.cpu.getDataMemory().availableSpInitialAddress;
    this.webview.postMessage({
      from: "extension",
      operation: "setRegister",
      register: "x2",
      value: intToBinary(spValue),
    });
  }

  public override step(): StepResult {
    try {
      // The executing instruction's own PC, captured before cycle() advances it.
      const executedPc = this.cpu.getPC();
      const stepResult = super.step();
      const instruction = stepResult.instruction;
      if (!instruction || Object.keys(instruction).length === 0) {
        this.stop({ sendStopMessage: true });
        return { instruction: {}, effect: {} };
      }
      instruction.currentPc = executedPc;
      // cycle() has already committed the register write, load, store and PC
      // advance; step() only reads the Cycle effect to notify the UI — the same
      // uniform path for both CPU kinds, with no downcast and no simulatorType
      // branch (ADR-0002).
      this.applyEffect(stepResult.effect);
      this.postStepUpdate(stepResult);
      if (this.cpu.finished()) {
        this.stop({ sendStopMessage: true });
      }
      return stepResult;
    } catch (error) {
      console.error("Error during simulation step:", error);
      this.stop({ sendStopMessage: true });
      return { instruction: {}, effect: {} };
    }
  }

  /**
   * Translates the Cycle effect into UI notifications: at most one register
   * write, at most one memory read or write. CPU-independent — the effect
   * already names what the clock committed (ADR-0002).
   */
  private applyEffect(effect: CycleEffect): void {
    const rw = effect.registerWrite;
    if (rw) {
      this.notifyRegisterWrite(rw.register, rw.value);
    }
    const ma = effect.memoryAccess;
    if (ma) {
      if (ma.kind === "read") {
        this.notifyMemoryRead(ma.address, ma.bytes);
      } else {
        this.notifyMemoryWrite(ma.address, ma.value, ma.bytes);
      }
    }
  }

  /**
   * Posts the per-step "step" message to the webview and moves the editor
   * highlight. This base version serves the (monocycle-shaped) text webview; the
   * pipeline graphic simulator overrides it to post the stage latches instead.
   */
  protected postStepUpdate(stepResult: StepResult): void {
    let line: number | undefined;
    try {
      line = this.rvDoc.getLineForIR(this.cpu.currentInstruction());
    } catch {
      line = undefined;
      this.stop({ sendStopMessage: true });
    }
    if (line !== undefined) this.highlightLine(line);
    this.webview.postMessage({
      from: "extension",
      operation: "step",
      newPc: this.cpu.getPC(),
      currentMonocycletInst: stepResult.instruction,
      result: this.datapathPayload(stepResult),
      lineDecorationNumber: line !== undefined ? line + 1 : -1,
    });
  }

  public override stop(options?: { sendStopMessage: boolean; isReset?: boolean }): void {
    if (!options?.isReset) {
      this.makeEditorWritable();
    }

    super.stop(options);
    this.clearHighlight();
    this.context.clearDecorations();
    if (this.selectionListenerDisposable) {
      this.selectionListenerDisposable.dispose();
      this.selectionListenerDisposable = undefined;
    }
    commands.executeCommand("setContext", "ext.isSimulating", false);
    if (options?.sendStopMessage ?? true) {
      this.sendToWebview({ operation: "stop" });
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
    this.sendToWebview({ operation: "simulatorType", simulatorType });
  }
  public override sendTextProgramToView(textProgram: string): void {
    this.sendToWebview({ operation: "textProgram", textProgram });
  }
  public override notifyRegisterWrite(register: string, value: string): void {
    this.sendToWebview({ operation: "setRegister", register, value });
  }
  public override notifyMemoryRead(address: number, length: number): void {
    this.sendToWebview({ operation: "readMemory", address, _length: length });
  }
  public override notifyMemoryWrite(address: number, value: string, length: number): void {
    this.sendToWebview({ operation: "writeMemory", address, value, _length: length });
  }

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
      return;
    }
    this.selectionListenerDisposable = window.onDidChangeTextEditorSelection((event) => {
      const line = event.selections?.[0]?.active.line;
      if (line !== undefined) {
        this.sendToWebview({ operation: "clickInLine", lineNumber: line + 1 });
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
        backgroundColor: "rgba(209, 227, 231, 0.5)",
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
      this.currentHighlight = undefined;
    }
  }
}

/**
 * Graphic simulator: extends the text simulator and additionally drives the
 * animated datapath diagram. The datapath render payload is sourced from the
 * concrete CPU's `datapathView()` — reached through a statically-typed reference
 * held by each per-CPU subclass, with no `as` and no branch on CPU kind
 * (ADR-0003). It is abstract because the view shape is irreducibly per-CPU.
 */
export abstract class GraphicSimulator extends TextSimulator {
  /**
   * The concrete CPU's Datapath view for the last clock. Each subclass reads it
   * off a statically-typed CPU reference; the union here is just the declared
   * return, never a downcast.
   */
  protected abstract datapathView(): MonocycleWires | PipelineStages;

  /**
   * Overrides the empty text payload: the datapath posted to the graphic webview
   * comes from the concrete CPU's `datapathView()` — the render snapshot captured
   * during the last `cycle()` (ADR-0003).
   */
  protected override datapathPayload(_stepResult: StepResult): MonocycleWires | PipelineStages {
    return this.datapathView();
  }

  public override async start(options?: { isRestart?: boolean }): Promise<void> {
    await super.start(options);
  }

  public override sendInitialData(options?: { isHardReset: boolean }): void {
    this.sendSimulatorTypeToView("graphic");
    super.sendInitialData(options);
    this.sendTextProgramToView(this.rvDoc.getText());
  }

  public override sendSimulatorTypeToView(simulatorType: string): void {
    this.sendToWebview({ operation: "simulatorType", simulatorType });
  }
  public override sendTextProgramToView(textProgram: string): void {
    this.sendToWebview({ operation: "textProgram", textProgram });
  }
}

/**
 * Single-cycle graphic simulator. Holds a statically-typed `SCCPU` so
 * `datapathView()` returns `MonocycleWires` with no downcast (ADR-0003).
 */
export class MonocycleGraphicSimulator extends GraphicSimulator {
  private readonly monocycleCpu: SCCPU;

  constructor(
    settings: SimulationParameters,
    rvDoc: RVDocument,
    context: RVContext,
    webview: Webview
  ) {
    const cpu = buildMonocycleCpu(rvDoc, settings);
    super(cpu, "monocycle", rvDoc, context, webview);
    this.monocycleCpu = cpu;
  }

  protected override datapathView(): MonocycleWires {
    return this.monocycleCpu.datapathView();
  }
}

/**
 * Pipeline graphic simulator. Holds a statically-typed `PipelineCPU` so
 * `datapathView()` returns `PipelineStages` with no downcast (ADR-0003).
 */
export class PipelineGraphicSimulator extends GraphicSimulator {
  private readonly pipelineCpu: PipelineCPU;

  constructor(
    settings: SimulationParameters,
    rvDoc: RVDocument,
    context: RVContext,
    webview: Webview
  ) {
    const cpu = buildPipelineCpu(rvDoc, settings);
    super(cpu, "pipeline", rvDoc, context, webview);
    this.pipelineCpu = cpu;
  }

  protected override datapathView(): PipelineStages {
    return this.pipelineCpu.datapathView();
  }

  /**
   * The pipeline webview consumes the five stage latches, not the monocycle
   * `newPc`/`currentMonocycletInst` shape, and drives no editor-line highlight.
   * Post just the datapath view, matching the pre-refactor pipeline path.
   */
  protected override postStepUpdate(stepResult: StepResult): void {
    this.webview.postMessage({
      from: "extension",
      operation: "step",
      result: this.datapathPayload(stepResult),
    });
  }
}
