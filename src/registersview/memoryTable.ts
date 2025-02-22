import {
  CellComponent,
  ColumnDefinition,
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

export class MemoryTable {
  private table: Tabulator;
  private tableData: any[] = [];
  private readonly memorySize: number;

  constructor(memorySize: number = 32) {
    this.memorySize = memorySize;
    this.table = this.initializeTable();
    this.setupEventListeners();
    this.initializeData();
  }

  private initializeTable(): Tabulator {
    return new Tabulator('#tabs-memory', {
      layout: 'fitColumns',
      layoutColumnsOnNewData: true,
      index: 'address',
      reactiveData: true,
      validationMode: 'blocking',
      columns: this.getColumnDefinitions()
    });
  }

  private getColumnDefinitions(): ColumnDefinition[] {
    // Default definitions that will be overriden by the following ones
    const defaultColumnAttributes: ColumnDefinition = {
      visible: true,
      frozen: true,
      headerSort: false,
      width: 80,
      headerHozAlign: 'center',
      formatter: 'html',
    } as ColumnDefinition;

    return [
      {
        ...defaultColumnAttributes,
        field: 'info',
        frozen: true,
        headerHozAlign: 'left',
        title: 'Info',
        width: 50
      },
      {
        ...defaultColumnAttributes,
        field: 'address',
        frozen: true,
        headerHozAlign: 'left',
        title: 'Addr.',
        width: 50
      },
      {
        ...defaultColumnAttributes,
        editable: true,
        editor: binaryMemEditor,
        field: 'value3',
        title: '0x3',
      },
      {
        ...defaultColumnAttributes,
        editable: true,
        editor: binaryMemEditor,
        field: 'value2',
        title: '0x2',
      },
      {
        ...defaultColumnAttributes,
        editable: true,
        editor: binaryMemEditor,
        field: 'value1',
        frozen: false,
        title: '0x1',
      },
      {
        ...defaultColumnAttributes,
        editable: true,
        editor: binaryMemEditor,
        field: 'value0',
        title: '0x0',
      },
      {
        ...defaultColumnAttributes,
        field: 'hex',
        formatter: (cell) => cell.getValue().toUpperCase(),
        title: 'HEX',
        width: 100,
      }
    ];
  }

  public importMemory(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => this.handleFileImport(e.target?.result as string);
    reader.readAsText(file);
  }

  public updateMemorySize(newSize: number) {
    const rounded = Math.round(newSize / 4) * 4;
    this.resizeMemory(rounded);
  }

  public enterInstructions(instructions: any[], symbols: any) {
    const instructionRows = this.prepareInstructionRows(instructions);
    this.updateTableWithInstructions(instructionRows, symbols);
  }

  private updateHexValue(row: any) {
    const hexParts = ['value3', 'value2', 'value1', 'value0'].map(field => {
      const binary = row.getData()[field];
      return parseInt(binary, 2).toString(16).padStart(2, '0');
    });
    row.update({ hex: hexParts.join('-') });
  }

  public getTable(): Tabulator {
    return this.table;
  }

  private setupEventListeners() {
    this.table.on("cellEdited", (cell) => {
      if (cell.getField().startsWith('value')) {
        this.updateHexValue(cell.getRow());
      }
    });

    this.table.on('tableBuilt', () => {
      this.table.setData(this.tableData);
    });
  }

  private initializeData() {
    const zeros8 = '00000000';
    range(0, this.memorySize / 4).forEach((address) => {
      this.tableData.unshift({
        address: (address * 4).toString(16),
        value0: zeros8,
        value1: zeros8,
        value2: zeros8,
        value3: zeros8,
        info: '',
        hex: '00-00-00-00'
      });
    });
  }

  private handleFileImport(fileContent: string) {
    const lines = fileContent
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line !== '');

    const newData: any[] = [];

    for (const line of lines) {
      const parts = line.split(':');
      if (parts.length !== 2) {
        console.error(`Invalid format in line: ${line}`);
        return;
      }

      const address = parseInt(parts[0].trim(), 16);
      const binaryValue = parts[1].trim();

      if (binaryValue.length !== 32 || !/^[01]+$/.test(binaryValue)) {
        console.error(`Invalid value in line: ${line}`);
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
        address: address.toString(16).toLowerCase(),
        value0,
        value1,
        value2,
        value3,
        hex: `${hex3}-${hex2}-${hex1}-${hex0}`.toUpperCase()
      });
    }

    this.table.updateOrAddData(newData);
  }

  private resizeMemory(newSize: number) {
    const totalBaseRows = newSize / 4;
    const allData = this.table.getData();
    const heapIndex = allData.findIndex(row => row.info && row.info.includes("Heap"));

    const instructionsRowsData = heapIndex !== -1 ? allData.slice(heapIndex + 1) : allData;
    const allRows = this.table.getRows();

    // Store instruction row backgrounds
    const instructionsBackground: string[] = [];
    if (heapIndex !== -1) {
      const instructionsRows = allRows.slice(heapIndex + 1);
      instructionsRows.forEach(row => {
        instructionsBackground.push(row.getElement().style.backgroundColor);
      });
    }

    // Create new base rows
    const zeros8 = "00000000";
    const newBaseRowsData = Array(totalBaseRows).fill(null).map(() => ({
      address: "",
      value0: zeros8,
      value1: zeros8,
      value2: zeros8,
      value3: zeros8,
      info: "",
      hex: "00-00-00-00"
    }));

    // Set SP and Heap markers
    if (newBaseRowsData.length > 0) {
      newBaseRowsData[0].info = `<span class="info-column-mem-table">SP</span>`;
      newBaseRowsData[newBaseRowsData.length - 1].info = `<span class="info-column-mem-table">Heap</span>`;
    }

    const newTableData = [...newBaseRowsData, ...instructionsRowsData];

    // Update table and recalculate addresses
    this.table.setData(newTableData).then(() => {
      const updatedRows = this.table.getRows();
      const totalRows = updatedRows.length;

      // Update addresses
      updatedRows.forEach((row, i) => {
        const newAddress = ((totalRows - 1 - i) * 4).toString(16);
        row.update({ address: newAddress });
      });

      // Restore instruction backgrounds
      for (let i = totalBaseRows; i < totalRows; i++) {
        const row = updatedRows[i];
        const bg = instructionsBackground[i - totalBaseRows] || "#FFF6E5";
        row.getElement().style.backgroundColor = bg;
      }
    });
  }

  private updateTableWithInstructions(instructions: any[], symbols: any) {
    const allRows = this.table.getRows();
    const totalRows = allRows.length;

    // Insert instructions into memory table
    instructions.forEach((instr, i) => {
      const binaryString = instr.encoding?.binEncoding || '';
      if (binaryString.length !== 32) {
        console.warn(`Instruction at index ${i} is not 32 bits: ${binaryString}`);
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
      if (targetRowIndex >= 0 && targetRowIndex < totalRows) {
        allRows[targetRowIndex].update({
          value3,
          value2,
          value1,
          value0,
          hex: hex.toUpperCase(),
          info: ""
        });
        allRows[targetRowIndex].getElement().style.backgroundColor = "#FFF6E5";
      }
    });

    // Set heap marker
    const heapRowIndex = totalRows - instructions.length - 1;
    if (heapRowIndex >= 0) {
      allRows[heapRowIndex].update({
        info: `<span class="info-column-mem-table">Heap</span>`
      });
    }

    // Set SP marker
    if (allRows[0]) {
      allRows[0].update({
        info: `<span class="info-column-mem-table">SP</span>`
      });
    }

    // Update symbol labels
    Object.values(symbols).forEach((symbol: any) => {
      const memdefHex = symbol.memdef.toString(16);
      const symbolRow = allRows.find(row => row.getData().address === memdefHex);
      if (symbolRow) {
        symbolRow.update({
          info: `<span class="info-column-mem-table-symbols">${symbol.name}</span>`
        });
      }
    });
  }
  private prepareInstructionRows(instructions: any[]): any[] {
    const zeros8 = '00000000';
    const newRowsData = Array(instructions.length).fill(null).map(() => ({
      address: 'temp',
      value0: zeros8,
      value1: zeros8,
      value2: zeros8,
      value3: zeros8,
      info: '',
      hex: '00-00-00-00'
    }));

    const allRows = this.table.getRows();
    const totalRows = allRows.length;

    // Recalculate addresses for all rows
    allRows.forEach((row, index) => {
      const newAddress = ((totalRows - 1 - index) * 4).toString(16);
      row.update({ address: newAddress });
    });

    return newRowsData;
  }

}