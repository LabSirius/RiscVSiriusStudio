import { TextDocument, window, EventEmitter, TextEditor } from 'vscode';

export type DocumentType = 'riscvasm' | 'riscvbin';

export class DocumentTracker {
  private currentDocument: TextDocument | undefined;
  private _onActiveDocumentChanged = new EventEmitter<{ document: TextDocument, type: DocumentType }>();

  readonly onActiveDocumentChanged = this._onActiveDocumentChanged.event;

  constructor() {
    window.onDidChangeActiveTextEditor((editor: TextEditor | undefined) => {
      if (editor) {
        const newDocument = editor.document;
        const documentType = this.getDocumentType(newDocument);

        if (documentType && this.currentDocument !== newDocument) {
          this.currentDocument = newDocument;
          this._onActiveDocumentChanged.fire({
            document: newDocument,
            type: documentType
          });
        }
      }
    });

  }

  private getDocumentType(document: TextDocument): DocumentType | undefined {
    const languageId = document.languageId;
    if (languageId === 'riscvasm') {
      return 'riscvasm';
    } else if (languageId === 'riscvbin') {
      return 'riscvbin';
    }
    return undefined;
  }

  getCurrentDocument(): TextDocument | undefined {
    return this.currentDocument;
  }
}
