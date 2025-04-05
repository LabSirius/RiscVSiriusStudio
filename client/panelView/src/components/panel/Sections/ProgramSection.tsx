import { useOperation } from '@/context/panel/OperationContext';
import { useLines } from '@/context/panel/LinesContext';
import Editor, { Monaco } from '@monaco-editor/react';
import { useTheme } from '../ui/theme/theme-provider';
import { useEffect, useRef, useState } from 'react';
import type { editor } from 'monaco-editor';

const ProgramSection = () => {
  const { textProgram } = useOperation();
  const { theme } = useTheme();
  const { lineDecorationNumber } = useLines();
  const editorTheme = theme === 'dark' ? 'my-custom-dark' : 'my-custom-light';
  
  const [editor, setEditor] = useState<editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<Monaco | null>(null);
  const decorationsRef = useRef<string[]>([]);

  useEffect(() => {
    if (!editor || lineDecorationNumber === -1 || !monacoRef.current) return;

    const range = new monacoRef.current.Range(
      lineDecorationNumber, 1,
      lineDecorationNumber, 1
    );

    const newDecorations: editor.IModelDeltaDecoration[] = [{
      range,
      options: {
        isWholeLine: true,
        className: 'highlighted-line',
        marginClassName: 'highlighted-line-margin'
      }
    }];

    decorationsRef.current = editor.deltaDecorations(decorationsRef.current, newDecorations);

    return () => {
      if (editor) {
        editor.deltaDecorations(decorationsRef.current, []);
      }
    };
  }, [lineDecorationNumber, editor]);

  const handleEditorDidMount = (editor: editor.IStandaloneCodeEditor) => {
    setEditor(editor);
  };

  const handleEditorWillMount = (monaco: Monaco) => {
    monacoRef.current = monaco; 
    
    monaco.editor.defineTheme('my-custom-light', {
      base: 'vs',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#00000000',
        'editor.foreground': '#333333',
        'editor.border': '#00000000',
        'focusBorder': '#00000000'
      }
    });

    monaco.editor.defineTheme('my-custom-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#00000000',
        'editor.foreground': '#D4D4D4',
        'editor.border': '#00000000',
        'focusBorder': '#00000000',
      }
    });
  };

  return (
    <div className="min-w-[30rem] max-w-[30rem] overflow-hidden min-h-min">
      <Editor
        height="100%"
        defaultLanguage="python"
        value={textProgram}
        theme={editorTheme}
        beforeMount={handleEditorWillMount}
        onMount={handleEditorDidMount}
        options={{
          readOnly: true,
          minimap: { enabled: false },
          renderLineHighlight: 'none',
          overviewRulerBorder: false,
          hideCursorInOverviewRuler: true,
          stickyScroll: { enabled: false },
          scrollbar: { 
            horizontal: 'hidden',
            verticalScrollbarSize: 0
          },
          wordWrap: 'off'
        }}
      />
    </div>
  );
};

export default ProgramSection;