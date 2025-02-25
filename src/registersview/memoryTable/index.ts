import {
  ColumnDefinition,
  TabulatorFull as Tabulator
} from 'tabulator-tables';

import { binaryMemEditor } from './helpers';

import { range, chunk, times } from 'lodash';
import { InternalRepresentation } from '../../utilities/riscvc';


export class MemoryTable {
  private table: Tabulator;
  private tableData: any[] = [];
  private memorySize: number;
  /**
   *  Index in the table when the code area ends. We assume that the code 
   * area starts at position 0.
   */
  private codeAreaEnd: number;
  /** Index in the table of the program counter */
  private pc: number;

  constructor(memorySize: number = 32) {
    this.memorySize = memorySize;
    this.codeAreaEnd = 0;
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
      editor: binaryMemEditor,
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
  

  public disableEditors() {
    const colDefs = this.getColumnDefinitions();

    const newColDefs = colDefs.map((def) => {
      if (def.field && def.field.startsWith('value')) {
        return {
          ...def,
          editor: undefined,   
          editable: () => false
        };
      }
      return def;
    });
    this.table.setColumns(newColDefs);

  }

  public importMemory(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => this.handleFileImport(e.target?.result as string);
    reader.readAsText(file);
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

  public resizeMemory(newSize: number) {
    if (newSize < 32) {
      throw new Error("Memory size must be at least 32 bytes.");
    }
    const rounded = Math.round(newSize / 4) * 4;
    // TODO: This seems to be quite slow. Investigate further.
    range(0, this.codeAreaEnd).forEach(() => {
      const address = this.table.getData()[0].address;
      this.table.deleteRow(address);
    });
    this.memorySize = rounded;
    this.allocateMemory();
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
      const memdefHex = symbol.memdef.toString(16);
      this.table.getRow(memdefHex).update({
        "info": `<span class="info-column-mem-table">${symbol.name}</span>`
      });
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
}