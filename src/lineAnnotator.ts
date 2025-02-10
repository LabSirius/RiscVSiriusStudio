import { TextEditor, ThemeColor, window } from "vscode";

export function annotateSourceLines(editor: TextEditor) {

  const decorationType = window.createTextEditorDecorationType({
    after: {
      contentText: '',
      color: new ThemeColor('editorLineNumber.foreground'),
      margin: '0 0 0 1em',
    },
    isWholeLine: true,
  });

  const decorations = [];
  // const ir = rvContext.getIR();

  for (let lineNumber = 0; lineNumber < editor.document.lineCount; lineNumber++) {
    //const lineIR = rvContext.getIRForInstructionAt(lineNumber);
    //if (lineIR) {
    decorations.push({
      range: editor.document.lineAt(lineNumber).range,
      renderOptions: {
        after: {
          contentText: `  // foooo`
        }
      }
    });
    // }
  }

  editor.setDecorations(decorationType, decorations);
}