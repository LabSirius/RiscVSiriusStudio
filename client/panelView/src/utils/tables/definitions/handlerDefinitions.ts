/* 
    * This file contains the definitions for the handlers of the registers table and the memory table.
*/

import { CellComponent } from 'tabulator-tables';

import { RegisterView } from '@/utils/tables/types';

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



//  DEFINITION COLUMNS HANDLERS IN REGISTER TABLE

// This function formats the name of the register to show the ABI name in parenthesis
export const registerNamesFormatter = (cell: CellComponent) => {
    const { name } = cell.getData();
    const [xname, abiname] = name.split(' ');
    return xname + ' (' + abiname + ')';
};

export const valueFormatter = (cell: CellComponent) => {
    const { value, viewType } = cell.getData();
    const { theme } = (cell.getColumn().getDefinition().formatterParams as { theme?: string }) || {};
    switch (viewType) {
      case 2: {
        const intValue = Number(binaryToInt(value));
        const binStr = binaryRepresentation(value);
        return intValue < 0 
        ? (theme === "dark" 
          ? `<div class="font-mono text-[#8BA0AA]">${binStr}</div>` 
          : `<div class="font-mono text-[#3A6973]">${binStr}</div>`)
      : `<div class="font-mono">${binStr}</div>`;

      }
      case 'signed': return binaryToInt(value);
      case 'unsigned': return binaryToUInt(value);
      case 16: return binaryToHex(value).toUpperCase();
      case 'ascii': return binaryToAscii(value);
      default: return value;
    }
};


// This function returns the editor for the value of the register
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
            // Elimina el último dígito y antepone un '0'
            editor.value = '0' + editor.value.substring(0, editor.value.length - 1);
          } else if(e.key === 'Enter'){
            handleSubmit();
          } else if(e.key === 'Escape'){
            cancel();
          } else {
            e.preventDefault();
          }
        });
      }
      else {
        editor.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') handleSubmit();
          if (e.key === 'Escape') cancel();
        });
      }
    
      editor.addEventListener('blur', handleSubmit);
    
      return editor;
};


// This function checks if the value is valid for the viewType
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


// This function formats the value of the register to the selected viewType
const formatValueAsType = (value: string, type: RegisterView): string => {
    switch (type) {
      case 'unsigned': return binaryToUInt(value);
      case 'signed': return binaryToInt(value);
      case 16: return binaryToHex(value);
      case 'ascii': return binaryToAscii(value);
      default: return value;
    }
};

// This function attaches the conversion toggle to the cell
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




  //  DEFINITION COLUMNS HANDLERS IN MEMORY TABLE


/**
 * This function creates a binary memory editor for the memory table.
 * It allows the user to edit the memory value in binary format.
 * The editor is an input element with a maximum length of 8 characters.
 * The editor is focused and selected when rendered.
 * The editor value is formatted to 8 characters with leading zeros.
 **/
export const binaryMemEditor = (
    cell: CellComponent,
    onRendered: (cb: () => void) => void,
    success: (value: string) => void,
    cancel: (restore?: boolean) => void
): HTMLInputElement => {
    const editor = document.createElement('input');
    editor.className = 'binary-editor';
    editor.value = cell.getValue() as string;
    editor.maxLength = 8;
    onRendered(() => {
        editor.focus();
        editor.select();
    });
    const formatValue = (value: string): string => value.padStart(8, '0').slice(0, 8);
    const commitEdit = () => {
        const rawValue = editor.value.replace(/[^01]/g, '');
        const formattedValue = formatValue(rawValue);
        editor.value = formattedValue;
        success(formattedValue);
    };
    editor.addEventListener('input', () => {
        editor.value = editor.value.replace(/[^01]/g, '');
    });
    editor.addEventListener('blur', commitEdit);
    editor.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Enter') commitEdit();
    if (e.key === 'Escape') cancel();
    });
    return editor;
};



/*
    * This function creates a tooltip for a cell in the memory table.
*/
export const createTooltip = (
    e: MouseEvent,
    cell: CellComponent,
    onRendered: (cb: () => void) => void
    ) => {
    const value = cell.getValue() as string;
    const tooltip = document.createElement('div');
    tooltip.className = ' text-white rounded-md px-2 py-1 overflow-hidden shadow-md max-w-min h-[1.8rem] z-[99999]';
    tooltip.innerHTML = value;
    onRendered(() => {
        tooltip.style.backgroundColor = 'transparent';
        tooltip.style.border = 'none';
        tooltip.style.position = 'absolute';
        tooltip.style.left = `${e.clientX + 17}px`;
        tooltip.style.top = `${e.clientY - 22}px`;
        document.body.appendChild(tooltip);
    });
    return tooltip;
};




/**  This function attaches a memory conversion toggle to a cell in the memory table.
 * The toggle allows the user to convert the memory value between hexadecimal and decimal.
 * The toggle is activated by pressing the 'd' key when the mouse is over the cell.
 * The toggle is deactivated by releasing the 'd' key.
**/

export const attachMemoryConversionToggle = (cell: CellComponent): void => {
    const cellElement = cell.getElement();
    const isAddressField = cell.getField() === 'address';
    const valueElement = isAddressField ? cellElement.querySelector('.address-value') : cellElement;
    const originalContent = valueElement ? valueElement.innerHTML : cellElement.innerHTML;
    let isConverted = false;
    let activeKey: string | null = null;

    const handleKeyDown = (evt: KeyboardEvent): void => {
      if (
        isConverted ||
        document.querySelector('input.binary-editor') ||
        document.querySelector('input.register-editor')
      ) {
        return;
      }
      const cellValue = cell.getValue() as string;
      let newContent: string | null = null;
      const key = evt.key.toLowerCase();
      if (isAddressField) {
        if (key === 'd') { newContent = parseInt(cellValue, 16).toString(); activeKey = 'd'; }
        else if (key === 'b') { newContent = parseInt(cellValue, 16).toString(2); activeKey = 'b'; }
      } else if (cell.getField().startsWith('value')) {
        if (key === 'd') { newContent = parseInt(cellValue, 2).toString(); activeKey = 'd'; }
        else if (key === 'h') { newContent = parseInt(cellValue, 2).toString(16).toUpperCase(); activeKey = 'h'; }
      }
      if (newContent && valueElement) {
        isConverted = true;
        valueElement.innerHTML = newContent;
      }
    };

    const handleKeyUp = (evt: KeyboardEvent): void => {
      if (activeKey && evt.key.toLowerCase() === activeKey && isConverted && valueElement) {
        isConverted = false;
        activeKey = null;
        valueElement.innerHTML = originalContent;
      }
    };

    const addListeners = (): void => {
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('keyup', handleKeyUp);
    };

    const removeListeners = (): void => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
      if (isConverted && valueElement) {
        isConverted = false;
        activeKey = null;
        valueElement.innerHTML = originalContent;
      }
    };

    cellElement.addEventListener('mouseenter', addListeners);
    cellElement.addEventListener('mouseleave', removeListeners);
};
