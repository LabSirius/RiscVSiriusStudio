import { EventEmitter, Event, TextEditor, window } from "vscode";

export class LineTracker {
  private _onDidChangeActiveLines: EventEmitter<void> = new EventEmitter<void>();
  private _editor: TextEditor | undefined;
  private _currentLine: number = 0;

  constructor() {
    // Subscribe to editor changes
    window.onDidChangeActiveTextEditor(editor => this.onActiveTextEditorChanged(editor));
    window.onDidChangeTextEditorSelection(() => {
      if (this._editor) {
        const line = this._editor.selection.active.line;
        if (line !== this._currentLine) {
          console.log(`Line changed to ${line}`);
          this._currentLine = line;
          this._onDidChangeActiveLines.fire();
        }
      }
    });
  }

  // Observable event that others can subscribe to
  get onDidChangeActiveLines(): Event<void> {
    return this._onDidChangeActiveLines.event;
  }

  // Get current active line
  get currentLine(): number {
    return this._currentLine;
  }

  private onActiveTextEditorChanged(editor: TextEditor | undefined) {
    console.log("Text editor changed", editor);
    if (editor === this._editor) {
      return;
    }
    this._editor = editor;
    this._onDidChangeActiveLines.fire();
  }

  // Get current editor
  get activeEditor(): TextEditor | undefined {
    return this._editor;
  }
}
