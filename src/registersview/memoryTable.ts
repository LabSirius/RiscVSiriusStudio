import {
  ColumnDefinition,
  TabulatorFull as Tabulator
} from 'tabulator-tables';

import {
  CellComponent,
} from 'tabulator-tables';


import { range, chunk, times } from 'lodash';
import { InternalRepresentation } from '../utilities/riscvc';


export class MemoryTable {
  public table: Tabulator;
  private tableData: any[] = [];
  private memorySize: number;
  /**
   *  Index in the table when the code area ends. We assume that the code 
   * area starts at position 0.
   */
  private codeAreaEnd: number;
  /** Index in the table of the program counter */
  private pc: number;

    private readonly binaryMemEditor =(
    cell: CellComponent,
    onRendered: (callback: () => void) => void,
    success: (value: string) => void,
    cancel: (restore?: boolean) => void,
    editorParams: any
  ): HTMLInputElement => {
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
  };

  constructor(memorySize: number = 32) {
    this.memorySize = memorySize;
    this.codeAreaEnd = 32;
    this.table = this.initializeTable();
    this.pc = 0;
    this.setupEventListeners();
  }
  private toTableIndex(index: number): number {
    return this.memorySize - 1 - index;
  }

  public updatePC(newPC: number) {
    let PCRowIndex = this.toTableIndex(this.pc);
    const pcRow = this.table.getRowFromPosition(PCRowIndex);
    pcRow.update({
      "info": `<span class="info-column-mem-table">NOPC</span>`
    });
    this.pc = newPC;
    PCRowIndex = this.toTableIndex(this.pc);
    const newPcRow = this.table.getRowFromPosition(PCRowIndex);
    newPcRow.update({
      "info": `<span class="info-column-mem-table">PC</span>`
    });
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
    const defaultColumnAttributes: ColumnDefinition = {
      title: "",
      visible: true,
      headerSort: false,
      headerHozAlign: 'center',
      formatter: 'html',
    };

    const defaultFrozenColumnAttributes: ColumnDefinition = {
      ...defaultColumnAttributes,
      frozen: true,
    };
  
    const defaultEditableColumnAttributes: ColumnDefinition = {
      ...defaultFrozenColumnAttributes,
      editor: this.binaryMemEditor,
      editable: true,
    };
  
    return [
      {
        ...defaultFrozenColumnAttributes,
        title: 'Info',
        field: 'info',
        width: 50,
        
      },
      {
        ...defaultFrozenColumnAttributes,
        title: 'Addr.',
        field: 'address',
        width: 50,
      
      },
      {
        ...defaultEditableColumnAttributes,
        title: '0x3',
        field: 'value3',
        width: 80,
      },
      {
        ...defaultEditableColumnAttributes,
        title: '0x2',
        field: 'value2',
        width: 80,
      },
      {
        ...defaultEditableColumnAttributes,
        title: '0x1',
        field: 'value1',
        width: 80,
        
      },
      {
        ...defaultEditableColumnAttributes,
        title: '0x0',
        field: 'value0',
        width: 80,
       
      },
      {
        ...defaultFrozenColumnAttributes,
        title: 'HEX',
        field: 'hex',
        width: 100,
        formatter: (cell) => cell.getValue().toUpperCase()
      }
    ];
  }
  

  public disableEditors(): void {
    this.table.getColumns().forEach(column => {
      const def = column.getDefinition();
      if (def.field && def.field.startsWith("value")) {
        const currentlyVisible = column.isVisible ? column.isVisible() : true;
        column.updateDefinition({
          ...def,
          editor: undefined,
          editable: () => false
        });
        if (!currentlyVisible) {
          column.hide();
        }
      }
    });
  }

 

  private updateHexValue(row: any) {
    const hexParts = ['value3', 'value2', 'value1', 'value0'].map(field => {
      const binary = row.getData()[field];
      return parseInt(binary, 2).toString(16).padStart(2, '0');
    });
    row.update({ hex: hexParts.join('-') });
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


  //TODO: Keep in mind that there is a limited area of ​​instructions
  public importMemory(content: string): void {
    const lines = content
      .split('\n')
      .map(line => line.trim())
      .filter(line => line !== '');

    const newData: any[] = [];

    for (const line of lines) {
      const parts = line.split(':');
      if (parts.length !== 2) {
        console.error(`Formato inválido en la línea: ${line}`);
        return;
      }

     
      const address = parseInt(parts[0].trim(), 16);
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

  public resizeMemory(newSize: number) {
    const rounded = Math.round(newSize / 4) * 4;
    this.memorySize = rounded;
    const totalBaseRows = rounded / 4;
  
    const zeros8 = "00000000";
    const defaultWord = {
      value0: zeros8,
      value1: zeros8,
      value2: zeros8,
      value3: zeros8,
      info: "",
      hex: "00-00-00-00"
    };
  
    const allData = this.table.getData();
  
    const heapIndex = allData.findIndex(row => row.info && row.info.includes("Heap"));
    const instructionsRowsData = heapIndex !== -1 ? allData.slice(heapIndex + 1) : [];
  
    const instructionsBackground: string[] = [];
    if (heapIndex !== -1) {
      const allRows = this.table.getRows();
      const instructionsRows = allRows.slice(heapIndex + 1);
      instructionsRows.forEach(row => {
        instructionsBackground.push(row.getElement().style.backgroundColor);
      });
    }

    const newBaseRowsData = [];
    for (let i = 0; i < totalBaseRows; i++) {
      newBaseRowsData.push({
        ...defaultWord,
        address: ""
      });
    }
  
    if (newBaseRowsData.length > 0) {
      newBaseRowsData[0].info = `<span class="info-column-mem-table">SP</span>`;
      newBaseRowsData[newBaseRowsData.length - 1].info = `<span class="info-column-mem-table">Heap</span>`;
    }
  
    const newTableData = newBaseRowsData.concat(instructionsRowsData);
  

    this.table.setData(newTableData).then(() => {
      const updatedRows = this.table.getRows();
      const totalRows = updatedRows.length;
      for (let i = 0; i < totalRows; i++) {
        const newAddress = ((totalRows - 1 - i) * 4).toString(16).toUpperCase();
        updatedRows[i].update({ address: newAddress });
      }
  
      for (let i = totalBaseRows; i < totalRows; i++) {
        const row = updatedRows[i];
        const bg = instructionsBackground[i - totalBaseRows] || "#FFF6E5";
        row.getElement().style.backgroundColor = bg;
      }
    });
  }
  
  public uploadProgram(ir: InternalRepresentation) {
    ir.instructions.reverse().forEach((instruction, index) => {
      const inst = instruction.inst.toString(16).toUpperCase();
      const binaryString = instruction.encoding.binEncoding;
      const hexString = instruction.encoding.hexEncoding;
      const words = chunk(binaryString.split(''), 8).map(group => group.join(''));

      this.table.updateOrAddRow(
        inst,
        {
          "address": inst,
          "value0": words[3], "value1": words[2],
          "value2": words[1], "value3": words[0],
          "info": "", "hex": hexString
        });
      this.table.getRow(inst).getElement().style.backgroundColor = "#FFF6E5";
      this.codeAreaEnd = inst;
    });

    Object.values(ir.symbols).forEach((symbol: any) => {
      const memdefHex = (symbol.memdef !== undefined ? symbol.memdef : 0).toString(16).toUpperCase();
      this.table.updateOrAddRow(
        memdefHex,
        {
          "info": `<span class="info-column-mem-table">${symbol.name}</span>`
        }
      );
    });
  }

  public allocateMemory() {
    const zeros8 = "00000000";
    const defaultWord = {
      value0: zeros8,
      value1: zeros8,
      value2: zeros8,
      value3: zeros8,
      info: "",
      hex: "00-00-00-00"
    };

    const startAddress = this.table.getData().length;

    const words = this.memorySize / 4;

    const mem = times(words, (i) => {
      const address = ((startAddress + i) * 4).toString(16).toUpperCase();
      return {
        ...defaultWord,
        "address": address,
      };
    });
    this.codeAreaEnd = mem.length;
    // Set heap and SP markers
    mem[0].info = `<span class="info-column-mem-table">Heap</span>`;
    mem[words - 1].info = `<span class="info-column-mem-table">SP</span>`;

    mem.forEach((i) => { this.table.addRow(i, true); });
  }

  public filterMemoryTableData(searchValue: string): void {
    this.resetMemoryCellColors();

    const searchTerms = searchValue.split(/\s+/);

    this.table.setFilter((data: any) => {
      const addr   = data.address?.toLowerCase() || '';
      const value3 = data.value3?.toLowerCase() || '';
      const value2 = data.value2?.toLowerCase() || '';
      const value1 = data.value1?.toLowerCase() || '';
      const value0 = data.value0?.toLowerCase() || '';
      const hex    = data.hex?.toLowerCase() || '';

      return searchTerms.every(term =>
        addr.includes(term) ||
        value3.includes(term) ||
        value2.includes(term) ||
        value1.includes(term) ||
        value0.includes(term) ||
        hex.includes(term)
      );
    });

    this.table.getRows().forEach(row => {
      row.getCells().forEach(cell => {
        let cellText = cell.getValue()?.toString() || '';
        const lowerCellText = cellText.toLowerCase();
        searchTerms.forEach(term => {
          if (lowerCellText.includes(term)) {
            const regex = new RegExp(`(${term})`, 'gi');
            cellText = cellText.replace(regex, `<mark>$1</mark>`);
          }
        });
    
        cell.getElement().innerHTML = cellText;
      });
    });
  }

  public resetMemoryCellColors(): void {
    this.table.getRows().forEach(row => {
      row.getCells().forEach(cell => {
        cell.getElement().style.backgroundColor = '';
      });
    });
  }
}