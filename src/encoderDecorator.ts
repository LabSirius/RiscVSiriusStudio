import { MarkdownString, TextDocument, TextEditor, TextEditorDecorationType, window } from "vscode";
import { RVDocument } from "./rvDocument";
import internal from "stream";
import { InternalRepresentation } from "./utilities/riscvc";

const encoderDecoration: TextEditorDecorationType = window.createTextEditorDecorationType({
  after: {
    margin: '0 0 0 3em',
    textDecoration: 'none',
    // color: '#999999'
  }
});

async function detailsMessage(ir: any | undefined): Promise<MarkdownString | undefined> {
  const markdown = new MarkdownString();
  markdown.isTrusted = true;
  markdown.supportHtml = true;
  markdown.supportThemeIcons = true;
  if (!ir) {
    markdown.appendMarkdown(`<h4>Undefined</h4>\n`);
  } else {
    markdown.appendMarkdown(`<h4 style="color: red;">Encoding for ${ir["asm"]}</h4>\n`);
    markdown.appendMarkdown(`<h5>${ir["asm"]}</h5>\n`);
    markdown.appendMarkdown(`
      <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="40" fill="red"/>
      </svg>`);
  }
  return markdown;
}

export class EncoderDecorator {


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

  public async decorate(editor: TextEditor, rvDoc: RVDocument) {
    console.log("####################");
    console.log("Decorating ", rvDoc.document.uri.toString());
    console.log("####################");

    const ml = EncoderDecorator.maxLength(editor.document);

    async function updateDecorations() {
      const decorations = [];
      for (let i = 0; i < editor.document.lineCount; i++) {
        const line = editor.document.lineAt(i);
        const ir = rvDoc.getIRForLine(i);
        const irText = ir ? ir.encoding.binEncoding : '';
        decorations.push({
          range: line.range,
          hoverMessage: await detailsMessage(ir),
          renderOptions: {
            // isWholeLine: true,
            after: {
              contentText: irText,
              margin: `0 0 0 ${(ml - line.text.length + 4) * 10}px`,
              // fontWeight: 'bold',
              textAlign: 'right',
              opacity: 0.5
            }
          }
        });
      }
      editor.setDecorations(encoderDecoration, decorations);
    }

    await updateDecorations();
  }

  public clearDecorations(editor: TextEditor) {
    editor.setDecorations(encoderDecoration, []);
  }
}
