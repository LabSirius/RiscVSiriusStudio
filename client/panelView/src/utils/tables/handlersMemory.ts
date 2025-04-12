import { chunk } from 'lodash';
import { intToHex, binaryToHex,  } from '@/utils/handlerConversions';
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


  // Apply row colors and hide empty info cells
  table.getRows().forEach(row => {
    const data = row.getData();
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
    setTimeout(() => cellElement.classList.remove('animate-pc'), 300);
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
  const hexColumn = tableInstance.getColumn("hex");

    if (showHexadecimal) {
      hexColumn.show();
    } else {
      hexColumn.hide();
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
export function filterMemoryData(searchInput: string, table: React.MutableRefObject<Tabulator | null>): void {
  // Convert search input to lowercase and trim whitespace.
  const lowerSearch = searchInput.trim().toLowerCase();
  const fieldsToSearch = ["address", "value3", "value2", "value1", "value0", "hex"];

  // If the search input is empty, clear the filter and restore the full dataset.
  if (lowerSearch === '') {
    table.current?.clearFilter(true);
    return;
  }

  // Apply filter: only keep rows where at least one specified field contains the search input.
  table.current?.setFilter((data) =>
    fieldsToSearch.some(field => {
      const cellVal = data[field];
      return cellVal !== undefined && cellVal.toString().toLowerCase().includes(lowerSearch);
    })
  );
}







/**
 * This function writes a value to a memory cell in the table.
 * It updates the corresponding row with the new value and highlights the cell.
 * 
 * @param tableInstance - Tabulator instance of the memory table.
 * @param address - Memory address to write to.
 * @param leng - Length of the value to write (1, 2, or 4 bytes).
 * @param value - Binary value to write to the memory cell.
 */
export const writeInMemoryCell = (
  tableInstance: Tabulator | null,
  address: number,
  leng: number,
  value: string,
  theme: string
): void => {
  if (!tableInstance) return;
  const rowStart = address - (address % 4);
  const hexRowStart = rowStart.toString(16).toUpperCase();
  const row = tableInstance.getRow(hexRowStart);
  if (!row) return;

  const rowElement = row.getElement();
  const cell0 = rowElement.querySelector('div[tabulator-field="value0"]') as HTMLElement | null;
  const cell1 = rowElement.querySelector('div[tabulator-field="value1"]') as HTMLElement | null;
  const cell2 = rowElement.querySelector('div[tabulator-field="value2"]') as HTMLElement | null;
  const cell3 = rowElement.querySelector('div[tabulator-field="value3"]') as HTMLElement | null;

  const newData: Partial<{ value3: string; value2: string; value1: string; value0: string }> = {};

  const updateCell = (
    cell: HTMLElement | null,
    segment: string,
    key: 'value0' | 'value1' | 'value2' | 'value3'
  ) => {
    if (!cell) return;
    cell.innerHTML = `<b>${segment}</b>`;
    newData[key] = segment;
  };

  if (leng === 1) {
    const segment = value.substring(24, 32);
    updateCell(cell0, segment, 'value0');
  } else if (leng === 2) {
    const lower16 = value.substring(16, 32);
    updateCell(cell1, lower16.substring(0, 8), 'value1');
    updateCell(cell0, lower16.substring(8, 16), 'value0');
  } else if (leng === 4) {
    updateCell(cell3, value.substring(0, 8), 'value3');
    updateCell(cell2, value.substring(8, 16), 'value2');
    updateCell(cell1, value.substring(16, 24), 'value1');
    updateCell(cell0, value.substring(24, 32), 'value0');
  }

  row.update(newData);

  const currentData = row.getData();
  const hexParts = ['value3', 'value2', 'value1', 'value0'].map((field) => {
    const binary: string = currentData[field];
    return parseInt(binary, 2).toString(16).padStart(2, '0');
  });
  row.update({ hex: hexParts.join('-').toUpperCase() });

  animateMemoryCell(tableInstance, address, leng, false, theme);
};

export const animateMemoryCell = (
  tableInstance: Tabulator,
  address: number,
  leng: number,
  onlyRead: boolean,
  theme? : string
): void => {
  
  const hexAddress = address.toString(16).toUpperCase();
  const row = tableInstance.getRow(hexAddress);
  if (!row) return;
  const rowElement = row.getElement();
  const binaryCells: Element[] = Array.from(
    rowElement.querySelectorAll('div[tabulator-field^="value"]')
  );
  const cellsToAnimate = leng === 4 ? binaryCells : binaryCells.slice(-leng);

  
  cellsToAnimate.forEach(cell => {

    if(onlyRead) {
      cell.classList.add('animate-cell');
    }else{
      if(theme === 'light') cell.classList.add('animate-cell', 'written-cell')
        else cell.classList.add('animate-cell', 'written-cell-dark')
    }
    
  });
  setTimeout(() => {
    cellsToAnimate.forEach(cell => cell.classList.remove('animate-cell'));
  }, 500);
  tableInstance.scrollToRow(hexAddress, 'center', true);
};


export const animateRow = (
  tableInstance: Tabulator,
  address: number,

): void => {
  const hexAddress = address.toString(16).toUpperCase();
  const row = tableInstance.getRow(hexAddress);
  if (!row) return;
  const rowElement = row.getElement();

  rowElement.classList.add('animate-row');
  
  setTimeout(() => {
    rowElement.classList.remove('animate-row');
  }, 500);

  tableInstance.scrollToRow(hexAddress, 'top', true);
};

export function animateArrowBetweenCells(
  table: Tabulator,
  currentAddress: number,
  targetAddress: number
): void {
  const currentHex = intToHex(currentAddress).toUpperCase();
  const targetHex = intToHex(targetAddress).toUpperCase();

  const currentRow = table.getRow(currentHex);
  const targetRow = table.getRow(targetHex);
  if (!currentRow || !targetRow) return;

  const currentCellEl = currentRow.getCell("address")?.getElement();
  const targetCellEl = targetRow.getCell("address")?.getElement();
  if (!currentCellEl || !targetCellEl) return;

  const fromRect = currentCellEl.getBoundingClientRect();
  const toRect = targetCellEl.getBoundingClientRect();
  const startX = fromRect.left + fromRect.width / 2;
  const startY = fromRect.top + fromRect.height / 2;
  const endX = toRect.left + toRect.width / 2;
  const endY = toRect.top + toRect.height / 2;

  const deltaX = endX - startX;
  const deltaY = endY - startY;
  const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);

  const svgNS = "http://www.w3.org/2000/svg";
  const container = document.createElement("div");
  const svg = document.createElementNS(svgNS, "svg");
  const path = document.createElementNS(svgNS, "path");
  const defs = document.createElementNS(svgNS, "defs");
  const marker = document.createElementNS(svgNS, "marker");

  container.style.position = "absolute";
  container.style.left = `${startX+12}px`;
  container.style.top = `${startY}px`;
  container.style.transformOrigin = "0 0";
  container.style.transform = `rotate(${angle}deg)`;
  if (angle === -90) {
    container.style.transform = `rotate(${angle}deg) scaleY(-1)`;
  } else {
    container.style.transform = `rotate(${angle}deg)`;
  }
  
  container.style.pointerEvents = "none";
  container.style.zIndex = "1000";


  svg.setAttribute("width", `${distance + 50}px`);
  svg.setAttribute("height", "24px");
  svg.style.overflow = "visible";
  

  marker.setAttribute("id", "arrowhead");
  marker.setAttribute("viewBox", "0 0 32 32");
  marker.setAttribute("refX", "22");
  marker.setAttribute("refY", "10");
  marker.setAttribute("markerWidth", "16");
  marker.setAttribute("markerHeight", "40");
  marker.setAttribute("orient", "180");

  const arrowPath = document.createElementNS(svgNS, "path");
  arrowPath.setAttribute(
    "d",
    "M6.4569 9.73276C6.17123 10.0327 6.18281 10.5074 6.48276 10.7931C6.78271 11.0788 7.25744 11.0672 7.5431 10.7672L6.4569 9.73276ZM12.5431 5.51724C12.8288 5.21729 12.8172 4.74256 12.5172 4.4569C12.2173 4.17123 11.7426 4.18281 11.4569 4.48276L12.5431 5.51724ZM12.5431 4.48276C12.2574 4.18281 11.7827 4.17123 11.4828 4.4569C11.1828 4.74256 11.1712 5.21729 11.4569 5.51724L12.5431 4.48276ZM16.4569 10.7672C16.7426 11.0672 17.2173 11.0788 17.5172 10.7931C17.8172 10.5074 17.8288 10.0327 17.5431 9.73276L16.4569 10.7672ZM12.75 5C12.75 4.58579 12.4142 4.25 12 4.25C11.5858 4.25 11.25 4.58579 11.25 5H12.75ZM11.25 19C11.25 19.4142 11.5858 19.75 12 19.75C12.4142 19.75 12.75 19.4142 12.75 19H11.25ZM7.5431 10.7672L12.5431 5.51724L11.4569 4.48276L6.4569 9.73276L7.5431 10.7672ZM11.4569 5.51724L16.4569 10.7672L17.5431 9.73276L12.5431 4.48276L11.4569 5.51724ZM11.25 5V19H12.75V5H11.25Z"
  );
  arrowPath.setAttribute("fill", "#3A6973");
  arrowPath.setAttribute("transform", "translate(10, -9)");
  marker.appendChild(arrowPath);
  defs.appendChild(marker);

  path.setAttribute("d", `M0,6 L${distance},6`);
  path.setAttribute("stroke", "#3A6973");
  path.setAttribute("stroke-width", "1.8");
  path.setAttribute("fill", "none");
  path.setAttribute("marker-end", "url(#arrowhead)");

  svg.appendChild(defs);
  svg.appendChild(path);
  container.appendChild(svg);
  document.body.appendChild(container);

  

  setTimeout(() => {
    container.remove();
  }, 500);


}
