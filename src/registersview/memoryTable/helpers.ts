import {
    CellComponent,
  } from 'tabulator-tables';

export function binaryMemEditor(
    cell: CellComponent,
    onRendered: (callback: () => void) => void,
    success: (value: string) => void,
    cancel: (restore?: boolean) => void,
    editorParams: any
  ): HTMLInputElement {
    const currentValue = cell.getValue();
    const editor = document.createElement('input');
  
    editor.className = 'binary-editor';
    editor.value = currentValue;
    editor.maxLength = 8;
  
    onRendered(() => {
      editor.focus();
      editor.select();
    });
  
    const formatValue = (value: string): string => {
      return value.padStart(8, '0').slice(0, 8);
    };
  
    const onSuccess = () => {
      const rawValue = editor.value.replace(/[^01]/g, '');
      const formattedValue = formatValue(rawValue);
  
      editor.value = formattedValue;
      success(formattedValue);
    };
  
    editor.addEventListener('input', (e) => {
      // Filtra caracteres no binarios en tiempo real
      editor.value = editor.value.replace(/[^01]/g, '');
    });
  
    editor.addEventListener('blur', onSuccess);
    editor.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { onSuccess(); };
      if (e.key === 'Escape') { cancel(); };
    });
  
    return editor;
  }