import {
  window,
  Uri,
  EventEmitter,
  Event,
  TextEditor,
  workspace,
  TextEditorDecorationType,
  commands,
} from "vscode";
import { RVDocument } from "./rvDocument";
import { RVContext } from "./support/context";
import { SCCPU, SCCPUResult } from "./vcpu/singlecycle";
import {
  branchesOrJumps,
  getFunct3,
  readsDM,
  usesRegister,
  writesDM,
  writesRU,
} from "./utilities/instructions";
import { binaryToInt, intToBinary } from "./utilities/conversions";

export type SimulationParameters = {
  memorySize: number;
};

export class Simulator {
  protected _context: RVContext;

  protected rvDoc: RVDocument;

  protected get editor(): TextEditor {
    return this.rvDoc.editor;
  }

  protected get context(): RVContext {
    return this._context;
  }

  /**
   * After construction, the simulator can still be configured by setting the
   * ammount of memory. After the first call to step it cannot be changed.
   */
  private _configured: boolean;
  public get configured(): boolean {
    return this._configured;
  }

  protected cpu: SCCPU;

  private didStep: EventEmitter<void> = new EventEmitter<void>();
  public readonly onDidStep: Event<void> = this.didStep.event;

  private didStop: EventEmitter<void> = new EventEmitter<void>();
  public readonly onDidStop: Event<void> = this.didStop.event;

  constructor(simParams: SimulationParameters, rvDoc: RVDocument, context: RVContext) {
    this._context = context;
    this.rvDoc = rvDoc;
    if (!rvDoc.ir) {
      throw new Error("RVDocument has no IR");
    }
    this.cpu = new SCCPU(rvDoc.ir.instructions, simParams.memorySize);
    this._configured = false;
  }

  start(): void {
    console.log("Simulator start");
  }

  step(): void {
    if (!this.configured) {
      // Prevent any further changes to configuration
      this._configured = true;
    }
    
    const instruction = this.cpu.currentInstruction();
    const result = this.cpu.executeInstruction();

    // Send messages to update the registers view.
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

    if (this.cpu.finished()) {
      return;
    }
  }

  stop(): void {
    this.didStop.fire();
  }

  // This function is called when the simulation finishes. (normally)
  finished(): void {
    this.stop();
  }

  public notifyRegisterWrite(register: string, value: string) {
    // do nothing. Must be implemented by the subclass.
  }

  public notifyMemoryRead(address: number, length: number) {
    // do nothing. Must be implemented by the subclass.
  }

  public notifyMemoryWrite(address: number, value: string, length: number) {
    // do nothing. Must be implemented by the subclass.
  }

  public animateLine(line: number) {
    // do nothing. Must be implemented by the subclass.
  }

  public resizeMemory(newSize: number): void {
    if (this.configured) {
      throw new Error("Cannot resize memory after configuration");
    } else {
      this.cpu.getDataMemory().resize(newSize);
      this.cpu.getRegisterFile().writeRegister("x2", intToBinary(newSize));
    }
  }

  public replaceMemory(newMemory: string[]): void {
    this.cpu.replaceDataMemory(newMemory);
  }

  public replaceRegisters(newRegisters: string[]): void {
    this.cpu.replaceRegisters(newRegisters);
  }

  private bytesToReadOrWrite() {
    const instruction = this.cpu.currentInstruction();
    const funct3 = getFunct3(instruction);
    let bytes;
    switch (funct3) {
      case "000":
        bytes = 1;
        break;
      case "001":
        bytes = 2;
        break;
      case "010":
        bytes = 4;
        break;
      default:
        throw new Error("Cannot deduce bytes to write from funct3");
    }
    return bytes;
  }

  private writeResult(result: SCCPUResult) {
    const instruction = this.cpu.currentInstruction();
    let bytesToWrite = this.bytesToReadOrWrite();
    const addressNum = parseInt(result.dm.address, 2);

    if (result.dm.dataWr.length < 32) {
      result.dm.dataWr = result.dm.dataWr.padStart(32, "0");
    }
    if (!this.cpu.getDataMemory().canWrite(bytesToWrite, addressNum)) {
      // TODO: notify the webview that the write failed and finish the simulation
      throw new Error(
        `Cannot write ${result.dm.dataWr} (${bytesToWrite} bytes)
         to memory address ${addressNum.toString(16)} 
         last address is ${this.cpu.getDataMemory().lastAddress().toString(16)} `
      );
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
    this.notifyMemoryWrite(parseInt(result.dm.address, 2), result.dm.dataWr, bytesToWrite);
    const chunks = result.dm.dataWr.match(/.{1,8}/g) as Array<string>;
    this.cpu.getDataMemory().write(chunks.reverse(), addressNum);
  }
  protected sendToMainView(message: any) {
    const view = this.context.mainWebviewView;
    if (!view) {
      throw new Error("Main view not found");
    }
    view.postMessage(message);
  }
}

export class TextSimulator extends Simulator {
  // Line highlighting
  private currentHighlight: TextEditorDecorationType | undefined;
  private selectionListenerDisposable: any;

  constructor(
    settings: SimulationParameters,
    rvDoc: RVDocument,
    context: RVContext,
    alreadyConfigured = false
  ) {
    super(settings, rvDoc, context);
  }

  private makeEditorReadOnly() {
    commands.executeCommand("workbench.action.files.toggleActiveEditorReadonlyInSession");
  }

  private makeEditorWritable() {
    commands.executeCommand("workbench.action.files.toggleActiveEditorReadonlyInSession");
  }

  public override start(): void {
    const mainView = this.context.mainWebviewView;
    if (!mainView) {
      // If the view is not available this will trigger its construction. The
      // first time the view is created the view becomes available and the flag
      // isSimulating is set to true, the context will call this method again.
      // The second time the view will be defined and thes case is not executed.
      return;
    } else {
      this.clickListener();
      const addressLine = this.rvDoc.ir?.instructions.map(instr => {
        const line = instr.location.start.line;
        const jump = branchesOrJumps(instr.type, instr.opcode) ? instr.encoding.imm13 : null;
        return { line, jump };
      }) || [];
      // Upload memory to webview
      mainView.postMessage({
        from: "extension",
        operation: "uploadMemory",
        payload: {
          memory: this.cpu.getDataMemory().getMemory(),
          codeSize: this.cpu.getDataMemory().codeSize,
          addressLine,
          symbols: this.rvDoc.ir?.symbols,
        }
      });
      this.makeEditorReadOnly();
      super.start();
      // upload sp information to  webview
      const spValue = this.cpu.getDataMemory().spInitialAddress;
      mainView.postMessage({
        from: "extension",
        operation: "setRegister",
        register: "x2",
        value: intToBinary(spValue),
      });

      // decorate the text editor
      const currentInst = this.cpu.currentInstruction();
      const lineNumber = this.rvDoc.getLineForIR(currentInst);

      if (lineNumber !== undefined) {
        this.highlightLine(lineNumber);
      } else {
        this.highlightLine(0);
      }
    }
  }

  public override step(): void {
    console.log(`%c[Simulator] step\n`, "color:pink");
    super.step();

    // Handle the visualization
    const mainView = this.context.mainWebviewView;
    mainView.postMessage({ from: "extension", operation: "step", pc: this.cpu.getPC() });

    const currentInst = this.cpu.currentInstruction();
    const lineNumber = this.rvDoc.getLineForIR(currentInst);

    if (lineNumber !== undefined) {
      this.highlightLine(lineNumber);
    }
  }

  public override animateLine(line: number): void {
    const editor = this.rvDoc.editor;
    if (!editor) {
      return;
    }
  
    const blinkDecoration = window.createTextEditorDecorationType({
      isWholeLine: true,
      backgroundColor: 'rgba(58, 108, 115, 0.3)'  
    });
  
    const range = editor.document.lineAt(line-1).range;
    let show = true;
  
    const intervalId = setInterval(() => {
      if (show) {
        editor.setDecorations(blinkDecoration, [range]);
      } else {
        editor.setDecorations(blinkDecoration, []);
      }
      show = !show;
    }, 250);
  
    setTimeout(() => {
      clearInterval(intervalId);
      editor.setDecorations(blinkDecoration, []); +
      blinkDecoration.dispose();
    }, 1000);
  }
  

  
  private clickListener() {
    if (this.selectionListenerDisposable) {
      return;
    }
    this.selectionListenerDisposable = window.onDidChangeTextEditorSelection(event => {
      if (!event.selections || event.selections.length === 0) {
        return;
      }
      const lineNumber = event.selections[0]?.active.line;
      const mainView = this.context.mainWebviewView;
      if (lineNumber === undefined) {
        return;
      }
      mainView.postMessage({
        from: "extension",
        operation: "clickInLine",
        lineNumber: lineNumber+1,
      });
    });
  }


  public override stop(): void {
    super.stop();
    if (this.currentHighlight) {
      this.currentHighlight.dispose();
    }
    const editor = window.activeTextEditor;
  if (editor) {
    this.context.resetEncoderDecorator(editor);
  }
    this.makeEditorWritable();
    const mainView = this.context.mainWebviewView;
      commands.executeCommand("setContext", "ext.isSimulating", false);
      mainView.postMessage({
        from: "extension",
        operation: "stop",
      });

  }

  public override notifyRegisterWrite(register: string, value: string) {
    // Warn the user if the register has a special meaning and the new value is
    // not valid
    // debugger;
    // const address = Number.parseInt(binaryToInt(value));
    // if (register === 'x2' && !this.cpu.getDataMemory().validAddress(address)) {
    //   const message = `Address ${address} is not valid for the current memory settings`;
    //   window.showErrorMessage(message);
    // }
    // const valueAsNumber = parseInt(value, 2);
    // if (register === 'x2' && !this.cpu.getDataMemory().validAAddress(value)) {
    //   const message = `Invalid PC value: ${value}`;
    //   window.showErrorMessage(message);
    // }

    //  Notify the main view that the register has been updated
    this.sendToMainView({
      from: "extension",
      operation: "setRegister",
      register: register,
      value: value,
    });
  }

  public override notifyMemoryRead(address: number, length: number) {
    this.sendToMainView({
      from: "extension",
      operation: "readMemory",
      address: address,
      _length: length,
    });
  }

  public override notifyMemoryWrite(address: number, value: string, length: number) {
    this.sendToMainView({
      from: "extension",
      operation: "writeMemory",
      address: address,
      value: value,
      _length: length,
    });
  }


  private highlightLine(lineNumber: number): void {
    const editor = this.rvDoc.editor;
    if (editor) {
      // Clear previous highlight if it exists
      if (this.currentHighlight) {
        this.currentHighlight.dispose();
      }

      // Create and store new decoration type
      this.currentHighlight = window.createTextEditorDecorationType({
        backgroundColor: "rgba(209, 227, 231, 0.5)",
        isWholeLine: true,
      });

      const range = editor.document.lineAt(lineNumber).range;
      editor.revealRange(range);
      const decoration = {
        range: range,
        hoverMessage: "Selected line",
      };
      editor.setDecorations(this.currentHighlight, [decoration]);
    }
  }
}
