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
  // private _document: TextDocument;
  private _editor: TextEditor;
  get editor(): TextEditor {
    return this._editor;
  }
  /**
   * Internal representation of the RISC-V assembly program built from the
   * document.
   *
   */
  private _ir: InternalRepresentation | undefined;
  get ir(): InternalRepresentation | undefined {
    if (!this._ir) {
      return undefined;
    }
    return this._ir;
  }
  /**
   * Maps line numbers in the document to the IR for that line.
   */
  private _lineIR: Map<number, any>;
  /**
   * Maps instructions in the IR to the line number in the document. The key is
   * the instruction address (inst field in the IR)
   */
  private _instructionLine: Map<number, number>;


  /**
   * Error object if the IR could not be built.
   */
  private _error: any;
  get error(): any {
    return this._error;
  }

  // get document(): TextDocument {
  //   return this._document;
  // }

  constructor(ed: TextEditor, rvContext: RVContext) {
    if (!RVDocument.isValid(ed.document)) {
      throw new Error('Document must be a RISC-V assembly file');
    }
    this._lineIR = new Map();
    this._instructionLine = new Map();
    this._editor = ed;

    workspace.onDidChangeTextDocument(e => {
      if (
        e.document === this.editor.document &&
        rvContext.configurationManager.getEncoderUpdatePolicy() === 'On change'
      ) {
        console.log("build and decorate trigger by document change");
        // TODO: this event is triggered twice, this can affect performance. I
        // need to investigate further.
        this.buildAndDecorate(rvContext);
      }
    });

    workspace.onDidSaveTextDocument(e => {
      if (
        e === this.editor.document &&
        rvContext.configurationManager.getEncoderUpdatePolicy() === 'On save'
      ) {
        console.log("build and decorate trigger by document save");
        this.buildAndDecorate(rvContext);
      }
    });

    console.log("Creating new riscv document from ", this.getFileName());
  }

  public async buildAndDecorate(rvContext: RVContext) {
    console.log("Document changed, rebuilding IR");
    if (!rvContext.encoderDecorator) { return; }
    this.build();
    if (!this.editor) {
      throw new Error("No editor found for this document");
    }
    rvContext.encoderDecorator.clearDecorations(this.editor);
    if (this.validIR()) {
      rvContext.encoderDecorator.decorate(this);
    } else {
      rvContext.encoderDecorator.decorateError(this);
    }
  }
  

  private syncIR() {
    if (!this.validIR) {
      throw new Error("Cannot sync IR for invalid IR");
    }
    this._lineIR.clear();
    this.ir?.instructions.forEach((instruction, index) => {
      const line = instruction.location.start.line - 1;
      this._lineIR.set(line, instruction);
      this._instructionLine.set(instruction.inst, line);
    });
  }

  public build(): void {

    const result = compile(this.getText(), this.getFileName());
    if (result.success) {
      this._ir = result.ir;
      this.syncIR();
    } else {
      this._ir = undefined;
      this._error = result.extra;
    }
    
  }

  public validIR(): boolean {
    return this._ir !== undefined;
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

  public getLineForIR(instruction: any): number | undefined {
    if (!this.validIR()) {
      return undefined;
    }
    const lineNumber = this._instructionLine.get(instruction.inst);
    if (lineNumber) {
      return lineNumber;
    } else {
      return undefined;
    }
  }

  public getText(): string {
    return this.editor.document.getText();
  }

  public getFileName(): string {
    return this.editor.document.fileName;
  }

  public static isValid(document: TextDocument): boolean {
    return document ? document.languageId === 'riscvasm' : false;
  }
}
