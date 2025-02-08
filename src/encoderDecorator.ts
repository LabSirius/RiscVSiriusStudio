import { TextDocument, TextEditor, window } from "vscode";
import { RVDocument } from "./rvDocument";
import { kMaxLength } from "buffer";

export class EncoderDecorator {
  private decorationType = window.createTextEditorDecorationType({
    after: {
      color: '#999999'
    }
  });

  private static maxLength(document: TextDocument): number {
    let max = 0;
    for (let i = 0; i < document.lineCount; i++) {
      const lineLength = document.lineAt(i).text.length;
      max = Math.max(max, lineLength);
    }
    return max;
  }

  /**
   * Returns a decoration for a given line.
   * @param line Source code line to decorate
   * @param ir Parser result for the line
   */
  private getDecorationForLine(line: string, lineNumber: number, lineIR: any,
    rvDoc: RVDocument): string {
    if (!rvDoc.validIR()) {
      throw new Error("Cannot get decoration for invalid IR");
    }
    const decorationText = lineIR ? lineIR.encoding.binEncoding as string : '';
    return decorationText;
  }

  public decorate(editor: TextEditor, rvDoc: RVDocument) {
    console.log("####################");
    console.log("Decorating ", rvDoc.document.uri.toString());
    console.log("####################");
    const decorations = [];

    const ml = EncoderDecorator.maxLength(editor.document);

    for (let i = 0; i < editor.document.lineCount; i++) {
      const line = editor.document.lineAt(i);
      const ir = rvDoc.getIRForLine(i);
      decorations.push({
        range: line.range,
        hoverMessage: line.text,
        renderOptions: {
          isWholeLine: true,
          after: {
            contentText: this.getDecorationForLine(line.text, i, ir, rvDoc),
            margin: `0 0 0 ${(ml - line.text.length + 4) * 10}px`,
            fontWeight: 'bold',
            textAlign: 'left',
            opacity: 0.5
          }
        }
      });
    }
    editor.setDecorations(this.decorationType, decorations);
  }

  public clearDecorations(editor: TextEditor) {
    editor.setDecorations(this.decorationType, []);
  }
}
