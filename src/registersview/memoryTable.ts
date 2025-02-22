import {
  CellComponent,
  GroupComponent,
  TabulatorFull as Tabulator
} from 'tabulator-tables';

import { range } from 'lodash';

function binaryMemEditor(
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

export function memorySetup(): Tabulator {
  const startTime = Date.now();
  const memorySize = 32;
  let tableData: any[] = []; //as Array<MemWord>;
  let table = new Tabulator('#tabs-memory', {
    layout: 'fitColumns',
    layoutColumnsOnNewData: true,
    index: 'address',
    reactiveData: true,
    validationMode: 'blocking',
    
    columns: [
      {
        title: 'Info',
        field: 'info',
        visible: true,
        formatter: 'html',
        headerSort: false,
        frozen: true,
        width:50,
      },
      {
        title: 'Addr.',
        field: 'address',
        visible: true,
        headerSort: false,
        frozen: true,
        width: 50
      },
      {
        title: '0x3',
        field: 'value3',
        formatter: 'html',
        headerHozAlign: 'center',
        visible: true,
        headerSort: false,
        editor: binaryMemEditor,
        editable: true,
        width: 80
      },
      {
        title: '0x2',
        field: 'value2',
        formatter: 'html',
        headerHozAlign: 'center',
        visible: true,
        headerSort: false,
        width: 80,
        editor: binaryMemEditor,
        editable: true,
      },
      {
        title: '0x1',
        field: 'value1',
        formatter: 'html',
        headerHozAlign: 'center',
        visible: true,
        headerSort: false,
        width: 80,
        editor: binaryMemEditor,
        editable: true,
      },
      {
        title: '0x0',
        field: 'value0',
        formatter: 'html',
        headerHozAlign: 'center',
        visible: true,
        headerSort: false,
        width: 80,
        editor: binaryMemEditor,
        editable: true,
      },
      {
        title: 'HEX',
        field: 'hex',
        headerHozAlign: 'center',
        visible: true,
        headerSort: false,
        width: 100,
        formatter: (cell) => cell.getValue().toUpperCase()
      }
    ]
  });

  range(0, memorySize / 4).forEach((address) => {
    const zeros8 = '00000000';
    tableData.unshift({
      address: (address * 4).toString(16),
      value0: zeros8,
      value1: zeros8,
      value2: zeros8,
      value3: zeros8,
      info: '',
      hex: '00-00-00-00'
    });
  });

  table.on("cellEdited", (cell) => {
    if (cell.getField().startsWith('value')) {
      updateHexValue(cell);
    }
  });

  table.on('tableBuilt', () => {
    table.setData(tableData);
  });
  return table;
}

function updateHexValue(cell: CellComponent) {
  const row = cell.getRow();
  const data = row.getData();

  const hexParts = ['value3', 'value2', 'value1', 'value0'].map(field => {
    const binary = data[field];
    return parseInt(binary, 2).toString(16).padStart(2, '0');
  });

  row.update({
    hex: hexParts.join('-')
  });
}


export function setupImportMemory(memoryTable: Tabulator) {
  document.getElementById('importMemoryBtn')?.addEventListener('click', () => {
    document.getElementById('fileInputImportMemory')?.click(); // Abrir el diálogo de archivo
  });

  document
    .getElementById('fileInputImportMemory')
    ?.addEventListener('change', (event) => {
      const input = event.target as HTMLInputElement;
      const file = input.files?.[0];

      if (!file) {
        return;
      }

      const reader = new FileReader();

      reader.onload = function (e) {
        if (!e.target?.result) {
          return;
        }

        const lines = (e.target.result as string)
          .split('\n')
          .map((line) => line.trim())
          .filter((line) => line !== '');

        const newData: any[] = [];

        for (const line of lines) {
          const parts = line.split(':');
          if (parts.length !== 2) {
            console.error(`Formato inválido en la línea: ${line}`);
            return;
          }

          const address = parseInt(parts[0].trim(), 16); // Ahora se convierte desde hexadecimal
          const binaryValue = parts[1].trim();

          if (binaryValue.length !== 32 || !/^[01]+$/.test(binaryValue)) {
            console.error(`Valor inválido en la línea: ${line}`);
            return;
          }

          const value0 = binaryValue.slice(24, 32);
          const value1 = binaryValue.slice(16, 24);
          const value2 = binaryValue.slice(8, 16);
          const value3 = binaryValue.slice(0, 8);

          const hex0 = parseInt(value0, 2).toString(16).padStart(2, '0');
          const hex1 = parseInt(value1, 2).toString(16).padStart(2, '0');
          const hex2 = parseInt(value2, 2).toString(16).padStart(2, '0');
          const hex3 = parseInt(value3, 2).toString(16).padStart(2, '0');

          newData.push({
            address: address.toString(16).toLowerCase(), // Mantiene la dirección en HEXA
            value0,
            value1,
            value2,
            value3,
            hex: `${hex3}-${hex2}-${hex1}-${hex0}`.toUpperCase() // Binario convertido a hex
          });
        }

        memoryTable.updateOrAddData(newData);
      };
      reader.readAsText(file);
    });
}


export function setUpMemoryConfig(memoryTable: Tabulator): void {
  const memorySizeInput = document.getElementById("memorySizeInput") as HTMLInputElement | null;
  if (!memorySizeInput) {return;};

  const updateMemoryBaseRows = () => {
  
    let value = parseInt(memorySizeInput.value, 10);
    if (isNaN(value) || value < 12) {
      value = 12;
      memorySizeInput.value = "12";
    }
    const rounded = Math.round(value / 4) * 4;
    memorySizeInput.value = rounded.toString();
    
    const totalBaseRows = rounded / 4; 

    const allData = memoryTable.getData();
  
    let heapIndex = allData.findIndex(row => row.info && row.info.includes("Heap"));

    const instructionsRowsData = heapIndex !== -1 ? allData.slice(heapIndex + 1) : allData;

    const allRows = memoryTable.getRows();
    const instructionsBackground: string[] = [];
    if (heapIndex !== -1) {
  
      const instructionsRows = allRows.slice(heapIndex + 1);
      instructionsRows.forEach(row => {
        instructionsBackground.push(row.getElement().style.backgroundColor);
      });
    }

    const newBaseRowsData = [];
    const zeros8 = "00000000";
    for (let i = 0; i < totalBaseRows; i++) {
      newBaseRowsData.push({
        address: "", 
        value0: zeros8,
        value1: zeros8,
        value2: zeros8,
        value3: zeros8,
        info: "",
        hex: "00-00-00-00"
      });
    }
    if (newBaseRowsData.length > 0) {
      newBaseRowsData[0].info = `<span class="info-column-mem-table">SP</span>`;
      newBaseRowsData[newBaseRowsData.length - 1].info = `<span class="info-column-mem-table">Heap</span>`;
    }

   
    const newTableData = newBaseRowsData.concat(instructionsRowsData);
    memoryTable.setData(newTableData).then(() => {
      const updatedRows = memoryTable.getRows();
      const totalRows = updatedRows.length;
      for (let i = 0; i < totalRows; i++) {
        const newAddress = ((totalRows - 1 - i) * 4).toString(16);
        updatedRows[i].update({ address: newAddress });
      }
      
      for (let i = totalBaseRows; i < totalRows; i++) {
        const row = updatedRows[i];
 
        const bg = instructionsBackground[i - totalBaseRows] || "#FFF6E5";
        row.getElement().style.backgroundColor = bg;
      }
      
    });
  };

  memorySizeInput.addEventListener("blur", updateMemoryBaseRows);
  memorySizeInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      updateMemoryBaseRows();
    }
  });
  memorySizeInput.addEventListener("change", updateMemoryBaseRows);
}


export function enterInstructionsInMemoryTable(memoryTable: Tabulator, instructions: any[], symbols: any) {
  
  const newRowsCount = instructions.length;
  const zeros8 = '00000000';
  const newRowsData: any[] = [];
  
  for (let i = 0; i < newRowsCount; i++) {
    newRowsData.push({
      address: 'temp', 
      value0: zeros8,
      value1: zeros8,
      value2: zeros8,
      value3: zeros8,
      info: '',
      hex: '00-00-00-00'
    });
  }
  
  memoryTable.addData(newRowsData, false);
  
  const allRows = memoryTable.getRows();
  const totalRows = allRows.length;
  
  // Recalculate addresses for all rows
  allRows.forEach((row, index) => {
    const newAddress = ((totalRows - 1 - index) * 4).toString(16);
    row.update({ address: newAddress });
  });
  
  // Inserts the instructions in the memory table
  instructions.forEach((instr, i) => {
    const binaryString = instr.encoding?.binEncoding || '';
    if (binaryString.length !== 32) {
      console.warn(`La instrucción en el índice ${i} no tiene 32 bits: ${binaryString}`);
      return;
    }
    
    const value3 = binaryString.slice(0, 8);
    const value2 = binaryString.slice(8, 16);
    const value1 = binaryString.slice(16, 24);
    const value0 = binaryString.slice(24, 32);
    
    const hex =
      parseInt(value3, 2).toString(16).padStart(2, '0') + '-' +
      parseInt(value2, 2).toString(16).padStart(2, '0') + '-' +
      parseInt(value1, 2).toString(16).padStart(2, '0') + '-' +
      parseInt(value0, 2).toString(16).padStart(2, '0');
    
    const targetRowIndex = totalRows - 1 - i;
    if (targetRowIndex < 0 || targetRowIndex >= totalRows) {
      console.warn(`No hay suficientes filas para la instrucción en el índice ${i}`);
      return;
    }
    
    // update the row with the instruction
    allRows[targetRowIndex].update({
      value3: value3,
      value2: value2,
      value1: value1,
      value0: value0,
      hex: hex.toUpperCase(),
      info: ""  
    });
    
    allRows[targetRowIndex].getElement().style.backgroundColor = "#FFF6E5";
  });
  
  // heap
  const targetHeapRowIndex = totalRows - instructions.length - 1;
  if (targetHeapRowIndex >= 0) {
    allRows[targetHeapRowIndex].update({
      info: `<span class="info-column-mem-table">Heap</span>`
    });
  }
  
  // SP
  if (allRows[0]) {
    allRows[0].update({
      info: `<span class="info-column-mem-table">SP</span>` 
    });
  }
  
  // Labels 
  Object.values(symbols).forEach((symbol: any) => {
    const memdefHex = symbol.memdef.toString(16);
    // Find the row with the corresponding address
    const symbolRow = allRows.find(row => row.getData().address === memdefHex);
    if (symbolRow) {
      // Update the row with the symbol name
      symbolRow.update({
        info: `<span class="info-column-mem-table-symbols">${symbol.name}</span>`
      });
    }
  });
}