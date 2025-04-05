import { useOperation } from '@/context/panel/OperationContext';
 import Editor, { Monaco } from '@monaco-editor/react';
 import { useTheme } from '../ui/theme/theme-provider';
 
 const ProgramSection = () => {
   const { textProgram } = useOperation();
   const { theme } = useTheme(); 
   const editorTheme = theme === 'dark' ? 'my-custom-dark' : 'my-custom-light';
 
   const handleEditorWillMount = (monaco: Monaco) => {
     monaco.editor.defineTheme('my-custom-light', {
       base: 'vs',
       inherit: true,
       rules: [],
       colors: {
         'editor.background': '#00000000', 
         'editor.foreground': '#333333'    ,
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
    <div className="min-w-[30rem] max-w-[30rem] overflow-scroll min-h-min">
       <Editor
         height="100%"
         defaultLanguage="python" 
         value={textProgram}
         theme={editorTheme}
         beforeMount={handleEditorWillMount}
         options={{
           readOnly: true,          
           minimap: { enabled: false },
           renderLineHighlight: 'none',
       overviewRulerBorder: false,
       hideCursorInOverviewRuler: true,
       stickyScroll: {
        enabled: false,
      },
      scrollbar: {
        horizontal: 'hidden', 
        verticalScrollbarSize: 0
      },
      wordWrap: 'off'
         }}
       />
     </div>
   )
 }

 
 export default ProgramSection