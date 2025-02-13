import { window, EventEmitter, Event, TextEditor, workspace } from "vscode";
import { RVDocument } from "./rvDocument";
import { RVContext } from "./support/context";
import { SCCPU } from "./vcpu/singlecycle";

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
    console.log("Simulator start");
    // window.showTextDocument(this.editor.document);
    console.log("Simulator start ", this.cpu.currentInstruction());
  }

  step(): void {
    console.log("Simulator step");
    this.didStep.fire();
  }

  stop(): void {
    console.log("Simulator stop");
    this.didStop.fire();
  }

  protected sendToMainView(message: any) {
    const view = this.context.mainWebviewView;
    if (!view) {
      throw new Error('Main view not found');
    }
    view.postMessage(message);
  }
}
