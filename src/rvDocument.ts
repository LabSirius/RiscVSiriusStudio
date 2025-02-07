import { Disposable, TextDocument, TextEditor, workspace, window } from "vscode";
import { compile, InternalRepresentation, ParserResult } from "./utilities/riscvc";
import { RVContext } from "./support/context";

/**
 * A RVDocument is reference to a vscode document that contans a RISC-V assembly
 * program. As such, that document can be used to build an intermediate
 * representation.
 */
export class RVDocument {

  private _document: TextDocument;
  private _ir: InternalRepresentation | undefined;
  get ir() {
    return this._ir;
  }

  get document(): TextDocument {
    return this._document;
  }

  constructor(document: TextDocument) {
    if (!RVDocument.isValid(document)) {
      throw new Error('Document must be a RISC-V assembly file');
    }
    // this._encoderDecorator = new EncoderDecorator();
    this._document = document;
    console.log("Creating new riscv document from ", this.getFileName());
  }

  public build(): ParserResult {
    console.log("Building IR for ", this.getFileName());
    const result = compile(this.getText(), this.getFileName());
    if (result.success) {
      this._ir = result.ir;
    }
    return result;
  }

  public validIR(): boolean {
    return this.ir !== undefined;
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
