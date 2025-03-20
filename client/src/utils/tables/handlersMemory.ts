
import { chunk } from 'lodash';
import { intToHex, binaryToHex,  } from '@/utils/tables/handlerConversions';
import { SymbolData } from '@/utils/tables/types';
import { TabulatorFull as Tabulator, CellComponent, RowComponent } from 'tabulator-tables';
import { MemoryRow } from '@/utils/tables/types';

/**
 * This function performs the following tasks:
 * 1. Divides the memory into "words" of 4 bytes and updates or adds rows in the table.
 * 2. Colors the rows based on whether the memory address is within the code area.
 * 3. Updates the "Heap" row using the code size.
 * 4. Labels the symbols in the table.
 * 5. Resets the program counter to 0.
 */
export const uploadMemory = (
  table: Tabulator,
  newMemory: string[],
  newCodeSize: number,
  newSymbols: Record<string, SymbolData>,
  pc: number
): void => {
  chunk(newMemory, 4).forEach((word: string[], index: number) => {
    const address = intToHex(index * 4).toUpperCase();
    const hex = word
      .slice()
      .reverse()
      .map((byte: string) => binaryToHex(byte).toUpperCase().padStart(2, '0'))
      .join('-');
    table.updateOrAddRow(address, {
      address,
      value0: word[0],
      value1: word[2],
      value2: word[1],
      value3: word[3],
      info: '',
      hex,
    });
    const row = table.getRow(address);
    if (row) {
      if (index * 4 < newCodeSize) {
        row.getElement().style.backgroundColor = '#FFF6E5';
      } else {
        row.getElement().style.backgroundColor = '';
      }
    }
  });

  // Update heap row
  const heapAddressHex = intToHex(newCodeSize).toUpperCase();
  table.updateOrAddRow(heapAddressHex, {
    address: heapAddressHex,
    value0: '00000000',
    value1: '00000000',
    value2: '00000000',
    value3: '00000000',
    info: `<span class="text-white text-[0.7rem]   bg-[#3A6973] p-[.4rem] rounded-md text-center">Heap</span>`,
    hex: '00-00-00-00',
  });

  // Add symbols to the table
  Object.values(newSymbols).forEach((symbol: SymbolData) => {
    const symbolAddress = intToHex(symbol.memdef - 4).toUpperCase();
    table.updateOrAddRow(symbolAddress, {
      address: symbolAddress,
      value0: '00000000',
      value1: '00000000',
      value2: '00000000',
      value3: '00000000',
      info: `<span class="text-white text-[0.7rem]  bg-[#3A6973] p-[.4rem] rounded-md text-center">${symbol.name}</span>`,
      hex: '00-00-00-00',
    });
  });
  updatePC(pc, { current: table });
};


/**
 * This function updates the program counter in the memory table.
 * It adds an icon to the row corresponding to the new program counter.
 */
export const createPCIcon = (): HTMLElement => {
    const icon = document.createElement('span');
    icon.className = 'pc-icon';
    icon.style.position = 'absolute';
    icon.style.top = '51%';
    icon.style.right = '5px';
    icon.style.transform = 'translateY(-50%)';
    icon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
                           fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"
                           class="lucide lucide-locate">
                           <line x1="2" x2="5" y1="12" y2="12"></line>
                           <line x1="19" x2="22" y1="12" y2="12"></line>
                           <line x1="12" x2="12" y1="2" y2="5"></line>
                           <line x1="12" x2="12" y1="19" y2="22"></line>
                           <circle cx="12" cy="12" r="7"></circle>
                         </svg>`;
    return icon;
  };
  
  export const updatePC = (newPC: number, tableInstanceRef: React.MutableRefObject<Tabulator | null>): void => {
    document.querySelectorAll('.pc-icon').forEach((icon) => icon.remove());
    const targetValue = (newPC * 4).toString(16).toUpperCase();
    const foundRows = tableInstanceRef.current?.searchRows('address', '=', targetValue) || [];
    if (foundRows.length === 0) return;
    const cell = foundRows[0].getCell('address');
    if (!cell) return;
    const cellElement = cell.getElement();
    cellElement.appendChild(createPCIcon());
    cellElement.classList.add('animate-pc');
    void cellElement.offsetWidth;
    setTimeout(() => cellElement.classList.remove('animate-pc'), 500);
};
  



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


export const createTooltip = (
    e: MouseEvent,
    cell: CellComponent,
    onRendered: (cb: () => void) => void
    ) => {
    const value = cell.getValue() as string;
    const tooltip = document.createElement('div');
    tooltip.className = ' text-white rounded-md px-2 py-1  shadow-md max-w-min max-h-[1.8rem] z-[99999]';
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



/**
 *  This function updates the hexadecimal value of a memory row.
 * It computes the hexadecimal value from the binary values of the row.
 * The hexadecimal value is displayed in the 'HEX' column of the memory table.
 */

export const updateHexValue = (row: RowComponent): void => {
    const rowData = row.getData() as MemoryRow;
    const fields: (keyof MemoryRow)[] = ['value3', 'value2', 'value1', 'value0'];
    const hexValue = fields
      .map(field => {
        const valueStr = rowData[field] !== undefined ? String(rowData[field]) : '0';
        return parseInt(valueStr, 2).toString(16).padStart(2, '0');
      })
      .join('-');
    row.update({ hex: hexValue });
};



export const setupEventListeners = (table: Tabulator): void => {
    table.on('cellEdited', (cell: CellComponent) => {
      if (cell.getField().startsWith('value')) {
        updateHexValue(cell.getRow());
        // const currentData = table.getData() as MemoryRow[];
        // const msg = { command: 'event', object: { event: 'memoryChanged', value: currentData } };
        // sendMessagetoExtension(msg);
      }
    });
  };


export const showHexadecimalInMemory = (): void => {
    console.log('Mostrando valores hexadecimales en la memoria');
};
export const assignMemoryInputValue = (value: number): void => {
    console.log('Asignando valor al input de memoria:', value);
};

export const configuration = (): void => {
    console.log('Realizando configuración adicional');
};





