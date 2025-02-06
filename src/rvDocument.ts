import { Disposable, TextDocument, workspace } from "vscode";
import { compile, InternalRepresentation, ParserResult } from "./utilities/riscvc";

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

  private _disposables: Disposable[] = [];

  get document(): TextDocument {
    return this._document;
  }

  constructor(document: TextDocument) {
    if (!RVDocument.isValid(document)) {
      throw new Error('Document must be a RISC-V assembly file');
    }
    this._document = document;
    console.log("Creating new riscv document from ", this.getFileName());

    workspace.onDidChangeTextDocument(e => {
      if (e.document === this._document) {
        this.build();
      }
    }, null, this._disposables);
    this.build();
  }


  public build(): ParserResult {
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
