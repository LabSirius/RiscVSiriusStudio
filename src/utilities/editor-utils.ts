import {
  window,
  TextEditor,
  Position,
  Range,
  OverviewRulerLane,
  TextEditorDecorationType,
  ThemeColor
} from 'vscode';

import { logger } from '../utilities/logger';

const memoryHighlightDecorationType = window.createTextEditorDecorationType({
  isWholeLine: true,
  textDecoration: 'wavy underline'
});

export function applyDecoration(line: number, editor: TextEditor) {
  const start = new Position(line, 0);
  const end = new Position(line, editor.document.lineAt(line).text.length);
  const decorationRange = new Range(start, end);
  editor.setDecorations(memoryHighlightDecorationType, [decorationRange]);
  editor.revealRange(decorationRange);
}

export function removeDecoration(editor: TextEditor) {
  editor.setDecorations(memoryHighlightDecorationType, []);
}
