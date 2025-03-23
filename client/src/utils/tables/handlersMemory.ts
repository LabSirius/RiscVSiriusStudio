
import { chunk } from 'lodash';
import { intToHex, binaryToHex,  } from '@/utils/tables/handlerConversions';
import { SymbolData } from '@/utils/tables/types';
import { TabulatorFull as Tabulator, CellComponent, RowComponent,  } from 'tabulator-tables';
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
  pc: number,
  onComplete?: () => void
): void => {
  const isInitialLoad = table.getData().length === 0;
  const expectedRowCount = newMemory.length / 4;
  const maxAddress = (expectedRowCount - 1) * 4;

  // Generate main data
  const mainRows = chunk(newMemory, 4).map((word, index) => {
    const address = intToHex(index * 4).toUpperCase();
    return {
      address,
      value0: word[0] || '00000000',
      value1: word[2] || '00000000',
      value2: word[1] || '00000000',
      value3: word[3] || '00000000',
      hex: word
        .slice()
        .reverse()
        .map((byte) => binaryToHex(byte || '00000000').toUpperCase().padStart(2, '0'))
        .join('-'),
      info: '',
      isCode: index * 4 < newCodeSize,
    };
  });

  // Update main data
  table.setData(mainRows);

  // Add/Update Heap
  const heapAddress = intToHex(newCodeSize).toUpperCase();
  const heapRow = table.getRow(heapAddress);
  
  if (heapRow) {
    // If the row exists, update only the info field
    heapRow.update({
      info: '<span class="text-white text-[0.7rem] bg-[#3A6973] p-[.4rem] rounded-md text-center">Heap</span>'
    });
  } else {
    // If it does not exist, add a new row
    table.addRow({
      address: heapAddress,
      value0: '00000000',
      value1: '00000000',
      value2: '00000000',
      value3: '00000000',
      info: '<span class="text-white text-[0.7rem] bg-[#3A6973] p-[.4rem] rounded-md text-center">Heap</span>',
      hex: '00-00-00-00',
      isCode: false,
    });
  }

  // Add/Update symbols
  Object.values(newSymbols).forEach(symbol => {
    const symbolAddress = intToHex(symbol.memdef).toUpperCase();
    const symbolRow = table.getRow(symbolAddress);

    if (symbolRow) {
      // Update only the info field if the row exists
      symbolRow.update({
        info: `<span class="text-white text-[0.7rem] bg-[#3A6973] p-[.4rem] rounded-md text-center">${symbol.name}</span>`
      });
    } else {
      // Add a new row if the symbol does not exist
      table.addRow({
        address: symbolAddress,
        value0: '00000000',
        value1: '00000000',
        value2: '00000000',
        value3: '00000000',
        info: `<span class="text-white text-[0.7rem] bg-[#3A6973] p-[.4rem] rounded-md text-center">${symbol.name}</span>`,
        hex: '00-00-00-00',
        isCode: false,
      });
    }
  });

  const spAddress = intToHex(newMemory.length - 4).toUpperCase();

  // Apply row colors and hide empty info cells
  table.getRows().forEach(row => {
    const data = row.getData();
    if (data.isCode && data.address !== spAddress) {
      row.getElement().style.backgroundColor = '#FFF6E5';
    } else {
      row.getElement().style.backgroundColor = '';
    }
    
    if (!data.info) {
      row.getCell("info").getElement().innerHTML = '<div style="opacity:0">\u00A0</div>';
    }
  });

  // Delete rows that are no longer needed
  if (!isInitialLoad) {
    const rowsToDelete = table.getRows()
      .filter(row => {
        const rowAddress = parseInt(row.getData().address, 16);
        return rowAddress > maxAddress && !row.getData().info;
      });
    
    if (rowsToDelete.length) {
      table.deleteRow(rowsToDelete.map(row => row.getData().address));
    }
  }

  updatePC(pc, { current: table });
  setSP(newMemory.length - 4, { current: table });

  onComplete?.();
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
 * Updates the stack pointer (SP) in the table using the instance reference.
 *
 * @param spValue - Number representing the new position for SP.
 * @param tableInstanceRef - Mutable reference to the Tabulator instance.
 * @param prevSP - (Optional) Previous hexadecimal address where the SP was.
 * @returns The new hexadecimal address assigned to the SP.
 */
export const setSP = (
  spValue: number,
  tableInstanceRef: React.MutableRefObject<Tabulator | null>,
  prevSP?: string
): string => {
  // Clears the SP mark in the previous row, if it exists
  if (prevSP && tableInstanceRef.current) {
    const prevRow = tableInstanceRef.current.getRow(prevSP.toUpperCase());
    if (prevRow) {
      prevRow.update({ info: "" });
    }
  }

  // Converts the numeric value to an uppercase hexadecimal address
  const address = intToHex(spValue).toUpperCase();


  // Updates the corresponding row to show the SP mark
  if (tableInstanceRef.current) {
    const targetRow = tableInstanceRef.current.getRow(address);
    if (targetRow) {
      targetRow.update({
        info: `<span class="text-white text-[0.7rem] bg-[#3A6973] p-[.4rem] rounded-md text-center">SP</span>`,
      });
    }
  }

  return address;
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


/**
 * This function toggles the visibility of the hexadecimal column in the memory table.
 */
export function toggleHexColumn(
  tableInstance: Tabulator,
  showHexadecimal: boolean
): void {
  let hexColumn;
  try {
    hexColumn = tableInstance.getColumn("hex");
  } catch  {
    return;
  }

  if (hexColumn) {
    if (showHexadecimal) {
      hexColumn.show();
    } else {
      hexColumn.hide();
    }
  } else {
    console.warn("La columna 'hex' no está disponible.");
  }
}

/**
 * Filters the memory table by checking if any of the specified fields contain the search string.
 * The fields include "address", "value3", "value2", "value1", "value0", and "hex".
 * 
 * Performance improvements:
 * - When the search input is empty, the filter is cleared and the cell styles are reset
 *   using requestAnimationFrame, avoiding a synchronous iteration over all rows.
 * - When a non-empty search is applied, only the active (visible) rows are processed for highlighting.
 */
export function filterMemoryData(searchInput: string, table: Tabulator): void {
  const lowerSearch = searchInput.trim().toLowerCase();
  const fieldsToSearch = ["address", "value3", "value2", "value1", "value0", "hex"];

  // If search input is empty, clear the filter and reset styles asynchronously
  if (lowerSearch === '') {
    table.clearFilter(true);
    requestAnimationFrame(() => {
      const activeRows = table.getRows("active");
      activeRows.forEach((row: RowComponent) => {
        row.getCells().forEach((cell: CellComponent) => {
          if (fieldsToSearch.includes(cell.getField())) {
            cell.getElement().style.backgroundColor = '';
          }
        });
      });
    });
    return;
  }

  // Set the filter: check if any of the specified fields contain the search substring
  table.setFilter((data) => {
    return fieldsToSearch.some(field => {
      const cellVal = data[field];
      return cellVal !== undefined && cellVal.toString().toLowerCase().includes(lowerSearch);
    });
  });

  // Update cell styles for active (visible) rows asynchronously to highlight matches
  requestAnimationFrame(() => {
    const activeRows = table.getRows("active");
    activeRows.forEach((row: RowComponent) => {
      row.getCells().forEach((cell: CellComponent) => {
        const field = cell.getField();
        if (fieldsToSearch.includes(field)) {
          const cellText = cell.getValue() !== undefined ? cell.getValue().toString().toLowerCase() : "";
          cell.getElement().style.backgroundColor = cellText.includes(lowerSearch) ? '#D1E3E7' : '';
        }
      });
    });
  });
}
