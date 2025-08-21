import { useSimulator } from '@/context/shared/SimulatorContext';
import { useLines } from '@/context/panel/LinesContext';
import Editor, { Monaco } from '@monaco-editor/react';
import { useTheme } from '@/components/ui/theme/theme-provider'; 
import { useEffect, useRef, useState } from 'react';
import type { editor } from 'monaco-editor';
import { useCustomOptionSimulate } from '@/context/shared/CustomOptionSimulate';
import { ArrowBigLeftDash, ArrowBigRightDash } from "lucide-react";

const ProgramSection = () => {
  const { textProgram } = useSimulator();
  const { theme } = useTheme();
  const { 
    lineDecorationNumber,  
    setClickInEditorLine, 
    clickAddressInMemoryTable, 
    setClickAddressInMemoryTable 
  } = useLines();

  const {switchAutoFocusOnNewLine} = useCustomOptionSimulate()
  
  const editorTheme = theme === 'dark' ? 'my-custom-dark' : 'my-custom-light';
  const [editor, setEditor] = useState<editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<Monaco | null>(null);
  const decorationsRef = useRef<string[]>([]);
  const addressDecorationsRef = useRef<string[]>([]);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const [showEditor, setShowEditor] = useState(true);

  // ... (tus hooks useEffect y manejadores no necesitan cambios) ...
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const handleWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) {
        event.preventDefault();
        event.stopPropagation();
        
        const parentScroller = wrapper.closest('.overflow-x-auto');
        
        if (parentScroller) {
          parentScroller.scrollLeft += event.deltaX;
        }
      }
    };

    wrapper.addEventListener('wheel', handleWheel, { capture: true });

    return () => {
      wrapper.removeEventListener('wheel', handleWheel, { capture: true });
    };
  }, []);

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

    if(switchAutoFocusOnNewLine){
       editor.revealLineInCenterIfOutsideViewport(lineDecorationNumber);
    }

    return () => {
      if (editor) {
        editor.deltaDecorations(decorationsRef.current, []);
      }
    };
  }, [lineDecorationNumber, editor, switchAutoFocusOnNewLine]);

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
    <div className="h-full">
      <div 
        ref={wrapperRef} 
        className={`h-full mt-1  flex relative ${!showEditor && "hidden"}  `}
      >
        <div className="flex-grow min-w-[25rem]  overflow-hidden relative">
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
                vertical: 'auto' 
              },
              wordWrap: 'off',
              glyphMargin: false 
            }}
          />
        </div>

        <div className="pl-1">
          <ArrowBigLeftDash
            onClick={() => setShowEditor(false)}
            strokeWidth={1.5}
            className={`min-w-[1.3rem] min-h-[1.3rem] w-[1.3rem] h-[1.3rem] cursor-pointer ${theme === 'light' ? 'text-black' : 'text-gray-400'}`}
          />
        </div>
      </div>

      {!showEditor && (
        <div
          onClick={() => setShowEditor(true)}
          className={`h-full w-[1.6rem] cursor-pointer rounded-[.2rem] border flex flex-col items-center uppercase group
    ${theme === "light" ? "bg-white border-gray-300" : "bg-[#1a1a1a] border-gray-700"}`}
        >
          <ArrowBigRightDash
            strokeWidth={1.5}
            className={`mt-[0.35rem] mb-1 transition ease-in-out min-w-[.9rem] min-h-[.9rem] w-[.9rem] h-[.9rem]
      ${
        theme === "light"
          ? "text-gray-700 group-hover:text-gray-800"
          : "text-gray-400 group-hover:text-gray-300"
      }`}
          />
          {"assembly".split("").map((char, index) => (
            <span
              key={index}
              className={`text-[.45rem] font-bold leading-[.91rem] transition ease-in-out
        ${
          theme === "light"
            ? "text-gray-700 group-hover:text-gray-800"
            : "text-gray-400 group-hover:text-gray-500"
        }`}>
              {char === " " ? "\u00A0" : char}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProgramSection;