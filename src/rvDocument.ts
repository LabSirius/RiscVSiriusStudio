import { Disposable, TextDocument, TextEditor, workspace, window } from "vscode";
import { compile, InternalRepresentation, ParserResult } from "./utilities/riscvc";
import { RVContext } from "./support/context";

/**
 * A RVDocument is reference to a vscode document that contans a RISC-V assembly
 * program. As such, that document can be used to build an intermediate
 * representation.
 */
export class RVDocument {

  /**
   * VSCode document that contains the RISC-V assembly program.
   */
  private _document: TextDocument;
  /**
   * Internal representation of the RISC-V assembly program built from the
   * document.
   *
   */
  private _ir: InternalRepresentation | undefined;
  get ir() {
    return this._ir;
  }

  private _lineIR: Map<number, any>;

  get document(): TextDocument {
    return this._document;
  }

  constructor(document: TextDocument, rvContext: RVContext) {
    if (!RVDocument.isValid(document)) {
      throw new Error('Document must be a RISC-V assembly file');
    }
    this._lineIR = new Map();
    this._document = document;

    workspace.onDidChangeTextDocument(e => {
      if (e.document === this._document) {
        // TODO: this event is triggered twice, this can affect performance. I
        // need to investigate further.
        console.log("Document changed, rebuilding IR");
        this.build();
        const editor = RVDocument.getEditorForDocument(this._document);
        if (editor) {
          if (this.validIR()) {
            rvContext.encoderDecorator.decorate(editor, this);
          } else {
            console.log("Invalid IR, should write another decorator to report the compiler error");
            rvContext.encoderDecorator.clearDecorations(editor);
          }
        }
      }
    });
    console.log("Creating new riscv document from ", this.getFileName());
  }

  private static getEditorForDocument(document: TextDocument): TextEditor | undefined {
    return window.visibleTextEditors.find(editor => editor.document === document);
  }

  private syncIR() {
    if (!this.validIR) {
      throw new Error("Cannot sync IR for invalid IR");
    }
    this._lineIR.clear();
    this.ir?.instructions.forEach((instruction, index) => {
      const line = instruction.location.start.line - 1;
      this._lineIR.set(line, instruction);
    });
  }

  public build(): void {
    console.log("Building IR for ", this.getFileName());
    const result = compile(this.getText(), this.getFileName());
    if (result.success) {
      this._ir = result.ir;
      this.syncIR();
    } else {
      this._ir = undefined;
    }
  }

  public validIR(): boolean {
    return this.ir !== undefined;
  }

  public getIRForLine(line: number): any | undefined {
    if (!this.validIR()) {
      return undefined;
    }
    const ir = this._lineIR.get(line);
    if (ir) {
      return ir;
    } else {
      return undefined;
    }
  }

  public getText(): string {
    return this.document.getText();
  }

  public getFileName(): string {
    return this.document.fileName;
  }

  public static isValid(document: TextDocument): boolean {
    return document ? document.languageId === 'riscvasm' : false;
  }
}
