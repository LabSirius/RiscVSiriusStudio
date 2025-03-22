import { CellComponent } from 'tabulator-tables';

import { Tabulator } from 'tabulator-tables';

import { RegisterView } from '@/utils/tables/types';

import { RefObject } from 'react';


import {
    binaryToUInt,
    binaryToInt,
    binaryToHex,
    binaryToAscii,
    binaryRepresentation,
    validUInt32,
    validInt32,
    validHex,
    validBinary,
    validAscii,
    toBinary
  } from '@/utils/tables/handlerConversions';


 export function updateRegisterValue(
    tabulatorRef: React.MutableRefObject<Tabulator | null>,
    registerWrite: string,
    registerData: string[]
  ) {
    if (!registerWrite || !tabulatorRef.current) return;
  
    const regNum = parseInt(registerWrite.replace('x', ''), 10);
    if (isNaN(regNum)) return;
  
    tabulatorRef.current.updateData([
      { rawName: registerWrite, value: registerData[regNum] }
    ]);
    
  }

export const registerNamesFormatter = (cell: CellComponent) => {
    const { name } = cell.getData();
    const [xname, abiname] = name.split(' ');
    return xname + ' (' + abiname + ')';
};

export const valueFormatter = (cell: CellComponent) => {
    const { value, viewType } = cell.getData();
    switch (viewType) {
      case 2: {
        const intValue = Number(binaryToInt(value));
        const binStr = binaryRepresentation(value);
        return intValue < 0 
  ? `<div class="font-mono text-slate-400"><span class="text-gray-600">${binStr}</span></div>` 
  : `<div class="font-mono ">${binStr}</div>`;

      }
      case 'signed': return binaryToInt(value);
      case 'unsigned': return binaryToUInt(value);
      case 16: return binaryToHex(value);
      case 'ascii': return binaryToAscii(value);
      default: return value;
    }
  };
  export const valueRegisterEditor = (
      cell: CellComponent,
      onRendered: (callback: () => void) => void,
      success: (value: string) => void,
      cancel: (value?: string) => void,
    ) => {
      const { value, viewType } = cell.getRow().getData();
      const editor = document.createElement('input');
      editor.className =
        'px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400';
      
      if(viewType === 2) {
        editor.value = value; 
      } else {
        editor.value = formatValueAsType(value, viewType);
      }
    
      const handleSubmit = () => {
        const newVal = editor.value;
        const valid = isValidAs(newVal, viewType);
        if (valid) {
          if(viewType === 2){
            success(newVal);
          } else {
            success(toBinary(newVal, viewType));
          }
        } else {
          editor.classList.add('border-red-500');
        }
      };
    
      onRendered(() => editor.focus());
    
      if(viewType === 2) {
        editor.addEventListener('keydown', (e) => {
          if(e.key === '0' || e.key === '1'){
            e.preventDefault();
            editor.value = editor.value.substring(1) + e.key;
          } else if(e.key === 'Backspace' || e.key === 'Delete'){
            e.preventDefault();
          } else if(e.key === 'Enter'){
            handleSubmit();
          } else if(e.key === 'Escape'){
            cancel();
          }
        });
      } else {
        editor.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') handleSubmit();
          if (e.key === 'Escape') cancel();
        });
      }
    
      editor.addEventListener('blur', handleSubmit);
    
      return editor;
    };

      // Valida el valor según el tipo de vista
  const isValidAs = (value: string, valType: RegisterView) => {
    switch (valType) {
      case 2: return validBinary(value) && value.length === 32;
      case 'unsigned': return validUInt32(value);
      case 'signed': return validInt32(value);
      case 16: return validHex(value);
      case 'ascii': return validAscii(value);
      default: return false;
    }
  };

  // Formatea el valor para el editor (excepto binario se deja tal cual)
  const formatValueAsType = (value: string, type: RegisterView): string => {
    switch (type) {
      case 'unsigned': return binaryToUInt(value);
      case 'signed': return binaryToInt(value);
      case 16: return binaryToHex(value);
      case 'ascii': return binaryToAscii(value);
      default: return value;
    }
  };


  export const attachConvertionToggle = (cell: CellComponent) => {
    const cellElement = cell.getElement();
    let originalContent = cellElement.innerHTML;
    const viewTypeCell = cell.getRow().getCell("viewType");
    let originalViewTypeContent = viewTypeCell.getElement().innerHTML;
    let isConverted = false;
    let activeKey: string | null = null;
  
    const keyDownHandler = (evt: KeyboardEvent) => {
      if (isConverted) return;
      if (
        document.querySelector('input.register-editor') ||
        document.querySelector('input.binary-editor')
      ) {
        return;
      }
      const data = cell.getData();
      const viewType = data.viewType;
      let newContent: string | null = null;
      let newViewTypeLabel: string | null = null;
      const key = evt.key.toLowerCase();
  
      if (viewType === 2) {
        if (key === 'd') {
          const unsignedVal = binaryToUInt(data.value);
          const signedVal = binaryToInt(data.value);
          newContent = (unsignedVal.toString() === signedVal.toString())
            ? signedVal.toString()
            : `${signedVal} / ${unsignedVal}`;
          newViewTypeLabel = "±10";
          activeKey = 'd';
        } else if (key === 'h') {
          newContent = binaryToHex(data.value);
          newViewTypeLabel = "hex";
          activeKey = 'h';
        }
      } else if (viewType === 'signed' || viewType === 'unsigned') {
        if (key === 'h') {
          newContent = binaryToHex(data.value);
          newViewTypeLabel = "hex";
          activeKey = 'h';
        } else if (key === 'b') {
          newContent = binaryRepresentation(data.value);
          newViewTypeLabel = "bin";
          activeKey = 'b';
        }
      } else if (viewType === 16) {
        if (key === 'd') {
          const unsignedVal = binaryToUInt(data.value);
          const signedVal = binaryToInt(data.value);
          newContent = (unsignedVal.toString() === signedVal.toString())
            ? signedVal.toString()
            : `${signedVal} / ${unsignedVal}`;
          newViewTypeLabel = "±10";
          activeKey = 'd';
        } else if (key === 'b') {
          newContent = binaryRepresentation(data.value);
          newViewTypeLabel = "bin";
          activeKey = 'b';
        }
      }
      if (newContent !== null) {
        isConverted = true;
        cellElement.innerHTML = newContent;
        if (newViewTypeLabel !== null) {
          viewTypeCell.getElement().innerHTML = newViewTypeLabel;
        }
      }
    };
  
    const keyUpHandler = (evt: KeyboardEvent) => {
      if (evt.key.toLowerCase() !== activeKey) return;
      if (isConverted) {
        isConverted = false;
        activeKey = null;
        cellElement.innerHTML = originalContent;
        viewTypeCell.getElement().innerHTML = originalViewTypeContent;
        cell.getRow().reformat();
      }
    };
  
    cellElement.addEventListener('mouseenter', () => {
      originalContent = cellElement.innerHTML;
      originalViewTypeContent = viewTypeCell.getElement().innerHTML;
      document.addEventListener('keydown', keyDownHandler);
      document.addEventListener('keyup', keyUpHandler);
    });
  
    cellElement.addEventListener('mouseleave', () => {
      document.removeEventListener('keydown', keyDownHandler);
      document.removeEventListener('keyup', keyUpHandler);
      if (isConverted) {
        isConverted = false;
        activeKey = null;
        cellElement.innerHTML = originalContent;
        viewTypeCell.getElement().innerHTML = originalViewTypeContent;
      }
    });
  };



export const createViewTypeFormatter = (
  setCurrentHovered: (cell: CellComponent | null) => void
) => {
  return (cell: CellComponent) => {
    const { viewType } = cell.getData();
    let tag = "";
    switch (viewType) {
      case 2: tag = "bin"; break;
      case 'unsigned': tag = "10"; break;
      case 'signed': tag = "±10"; break;
      case 16: tag = "hex"; break;
      default: tag = String(viewType);
    }
    const container = document.createElement("div");
    container.className = "flex justify-between items-center w-full";
    const textSpan = document.createElement("span");
    textSpan.textContent = tag;
    const iconSpan = document.createElement("span");
    iconSpan.className = "cursor-pointer ml-1";
    iconSpan.innerHTML = `<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <polyline points="6 9 12 15 18 9"></polyline>
    </svg>`;
    container.appendChild(textSpan);
    container.appendChild(iconSpan);
    
    container.addEventListener("mouseenter", () => {
      setCurrentHovered(cell);
    });
    container.addEventListener("mouseleave", () => {
      setCurrentHovered(null);
    });
    
    let activated = false;
    container.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!activated) {
        activated = true;
        cell.getElement().dataset.allowEdit = "true";
        cell.edit();
        setTimeout(() => { activated = false; }, 300);
      }
    });
    
    return container;
  };
};


// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const handleGlobalKeyPress = (currentHoveredViewTypeCell: RefObject<any>) => {
  return (e: KeyboardEvent) => {
    const key = e.key.toLowerCase();
    const keyMap: Record<string, RegisterView> = {
      b: 2,
      s: "signed",
      u: "unsigned",
      h: 16,
      a: "ascii",
    };

    if (currentHoveredViewTypeCell.current && keyMap[key]) {
      const row = currentHoveredViewTypeCell.current.getRow();
      row?.update({ viewType: keyMap[key] });
      row?.reformat();
    }
  };
};