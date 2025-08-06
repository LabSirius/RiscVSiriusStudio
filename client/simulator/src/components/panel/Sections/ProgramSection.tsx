import { useSimulator } from '@/context/shared/SimulatorContext';
import { useLines } from '@/context/panel/LinesContext';
import Editor, { Monaco } from '@monaco-editor/react';
import { useTheme } from '@/components/ui/theme/theme-provider'; 
import { useEffect, useRef, useState } from 'react';
import type { editor } from 'monaco-editor';

const ProgramSection = () => {
  const { textProgram } = useSimulator();
  const { theme } = useTheme();
  const { 
    lineDecorationNumber,  
    setClickInEditorLine, 
    clickAddressInMemoryTable, 
    setClickAddressInMemoryTable 
  } = useLines();
  
  const editorTheme = theme === 'dark' ? 'my-custom-dark' : 'my-custom-light';
  const [editor, setEditor] = useState<editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<Monaco | null>(null);
  const decorationsRef = useRef<string[]>([]);
  const addressDecorationsRef = useRef<string[]>([]);

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
      }
    }];

    decorationsRef.current = editor.deltaDecorations(decorationsRef.current, newDecorations);

    return () => {
      if (editor) {
        editor.deltaDecorations(decorationsRef.current, []);
      }
    };
  }, [lineDecorationNumber, editor]);

  useEffect(() => {
    if (!editor || clickAddressInMemoryTable === -1 || !monacoRef.current) return;

    const lineNumber = clickAddressInMemoryTable;
    const range = new monacoRef.current.Range(lineNumber, 1, lineNumber, 1);

    editor.revealLineInCenterIfOutsideViewport(lineNumber);

    const newAddressDecoration: editor.IModelDeltaDecoration[] = [{
      range,
      options: {
        linesDecorationsClassName: 'address-margin-decoration',
      }
    }];

    addressDecorationsRef.current = editor.deltaDecorations(
      addressDecorationsRef.current, 
      newAddressDecoration
    );

    const timer = setTimeout(() => {
      addressDecorationsRef.current = editor.deltaDecorations(
        addressDecorationsRef.current, 
        []
      );
      setClickAddressInMemoryTable(-1);
    }, 1000);

    return () => {
      clearTimeout(timer);
      editor.deltaDecorations(addressDecorationsRef.current, []);
    };
  }, [clickAddressInMemoryTable, editor, setClickAddressInMemoryTable]);

  const handleEditorDidMount = (editor: editor.IStandaloneCodeEditor) => {
    setEditor(editor);
    
    editor.onMouseDown((e) => {
      if (e.target.position?.lineNumber) {
        setClickInEditorLine(e.target.position.lineNumber);
      }
    });
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
    <div className="min-w-[30rem] max-w-[30rem] overflow-hidden min-h-min relative left-[-3rem] mt-1">
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
          wordWrap: 'off',
          glyphMargin: true 
        }}
      />
    </div>
  );
};

export default ProgramSection;