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

  public decorate(editor: TextEditor, rvDoc: RVDocument) {
    console.log("Decorating ", rvDoc.document.uri.toString());
    const decorations = [];

    const ml = EncoderDecorator.maxLength(editor.document);

    for (let i = 0; i < editor.document.lineCount; i++) {
      const line = editor.document.lineAt(i);
      const ir = rvDoc.getIRForLine(i);
      const decorationText = ir ? ir.encoding.binEncoding : '';
      console.log(line.text, ir);
      decorations.push({
        range: line.range,
        hoverMessage: line.text,
        renderOptions: {
          isWholeLine: true,
          after: {
            // contentText: line.text.trim(),
            contentText: decorationText,
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
}
