import {
  ColumnDefinition,
  TabulatorFull as Tabulator
} from 'tabulator-tables';

import {
  CellComponent,
} from 'tabulator-tables';

import { intToHex, binaryToHex } from '../utilities/conversions';
import { range, chunk, times } from 'lodash';
import { InternalRepresentation } from '../utilities/riscvc';
import { parse } from 'path';
import { error } from 'console';


export class MemoryTable {
  public table: Tabulator;
  private tableData: any[];

  private memorySize: number;
  /**
   *  Index in the table when the code area ends. We assume that the code 
   * area starts at position 0.
   */
  private codeAreaEnd: number;
  /** Index in the table of the program counter */
  private pc: number;
  /** Address in the table of the stack pointer */
  private sp: string;

  private readonly binaryMemEditor = (
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

  constructor(memory: string[], codeSize: number, symbols: any[]) {
    this.memorySize = memory.length;
    // Forward initialization to prevent warnings
    this.sp = "";
    this.pc = 0;
    this.codeAreaEnd = codeSize;

    this.tableData = chunk(memory, 4).map((word, index) => {
      const address = intToHex(index * 4).toUpperCase();
      return {
        "index": index,
        "address": address,
        "value0": word[3], "value1": word[2],
        "value2": word[1], "value3": word[0],
        "info": "",
        "hex": word
          .map(byte => binaryToHex(byte).toUpperCase().padStart(2, "0"))
          .join("-")
      };

    });
    this.table = this.initializeTable();
    this.table.on("tableBuilt", () => {
      this.table.getRows().forEach((row) => {
        const index = row.getData().index;
        if (index * 4 < codeSize) {
          row.getElement().style.backgroundColor = "#FFF6E5";
        }
      });

      const heapAddress = codeSize;
      const heapAddressHex = intToHex(heapAddress).toUpperCase();
      this.table.updateRow(
        heapAddressHex,
        {
          "info": `<span class="info-column-mem-table">Heap</span>`
        }
      );

      const spAddressHex = intToHex(this.memorySize - 4).toUpperCase();
      this.table.updateOrAddRow(
        spAddressHex,
        {
          "info": `<span class="info-column-mem-table">SP</span>`
        }
      );
      this.sp = spAddressHex;

      Object.values(symbols).forEach((symbol: any) => {
        const address = symbol.memdef;
        const memdefHex = intToHex(address).toUpperCase();
        this.table.updateOrAddRow(
          memdefHex,
          {
            "info": `<span class="info-column-mem-table">${symbol.name}</span>`
          }
        );
      });
      this.updatePC(0);
    });

    this.setupEventListeners();
  }

  public reInitializeTable() {
    this.table = this.initializeTable();
  }

  public setSP(value: string) {
    this.table.getRow(this.sp).update(
      { "info": '' }
    );
    const address = binaryToHex(value).toUpperCase();
    this.table.getRow(address).update(
      { "info": `<span class="info-column-mem-table">SP</span>` }
    );
  }


  public updatePC(newPC: number) {
    const allIcons = document.querySelectorAll('.pc-icon');
    allIcons.forEach(icon => icon.remove());

    const targetValue = (newPC * 4).toString(16).toUpperCase();
    const foundRows = this.table.searchRows("address", "=", targetValue);
    if (foundRows.length > 0) {
      const row = foundRows[0];
      const cell = row.getCell("address");
   
      if (cell) {
        const cellElement = cell.getElement();

        const iconSpan = document.createElement('span');
        iconSpan.className = 'pc-icon';

        iconSpan.style.position = 'absolute';
        iconSpan.style.top = '51%';
        iconSpan.style.right = '5px';
        iconSpan.style.transform = 'translateY(-50%)';

        iconSpan.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
                                fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"
                                class="lucide lucide-locate">
                                <line x1="2" x2="5" y1="12" y2="12"></line>
                                <line x1="19" x2="22" y1="12" y2="12"></line>
                                <line x1="12" x2="12" y1="2" y2="5"></line>
                                <line x1="12" x2="12" y1="19" y2="22"></line>
                                <circle cx="12" cy="12" r="7"></circle>
                              </svg>`;

        cellElement.appendChild(iconSpan);

        cellElement.classList.add('animate-pc');
        void cellElement.offsetWidth;
        setTimeout(() => {
          cellElement.classList.remove('animate-pc');
        }, 500);
      }
    }
  }


  private initializeTable(): Tabulator {
    return new Tabulator('#tabs-memory', {
      layout: 'fitColumns',
      layoutColumnsOnNewData: true,
      index: 'address',
      data: this.tableData,
      reactiveData: true,
      validationMode: 'blocking',
      initialSort: [
        { column: 'address', dir: 'desc' }
      ],
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
      cellMouseEnter: (e, cell) => {
        this.attachMemoryConversionToggle(cell);
      }
    };

    return [
      {
        ...defaultColumnAttributes,
        visible: false,
        field: 'index',
      },
      {
        ...defaultFrozenColumnAttributes,
        title: 'Info',
        field: 'info',
        width: 60,
        formatter: (cell) => {
          const value = cell.getValue();
          return `<span class="truncated-info">${value}</span>`;
        },
        
        tooltip: (function(e: any, cell: any, onRendered: any) {
          const value = cell.getValue();
          const tooltip = document.createElement("div");
          tooltip.className = "custom-tooltip";
          tooltip.innerHTML = value;
          
          onRendered(() => {
            tooltip.style.position = "absolute";
            tooltip.style.left = `${e.clientX + 17}px`; 
            tooltip.style.top = `${e.clientY - 22}px`;
            document.body.appendChild(tooltip);
          });
          return tooltip;
        }) as any,
      },
    
      {
        ...defaultFrozenColumnAttributes,
        title: 'Addr.',
        field: 'address',
        sorter: (a, b) => { return parseInt(a, 16) - parseInt(b, 16); },
        headerSort: true,

        width: 75,
        formatter: (cell) => `<span class="address-value">${cell.getValue().toUpperCase()}</span>`,
        cellMouseEnter: (e, cell) => {
          this.attachMemoryConversionToggle(cell);
        }
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
        width: 100
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
  }

  private readonly attachMemoryConversionToggle = (cell: CellComponent): void => {
    const cellElement = cell.getElement();
    const isAddress = cell.getField() === 'address';
    const valueElement = isAddress ? cellElement.querySelector('.address-value') : cellElement;
    let originalContent = valueElement ? valueElement.innerHTML : cellElement.innerHTML;
    let isConverted = false;
    let activeKey: string | null = null;

    const keyDownHandler = (evt: KeyboardEvent) => {
      if (isConverted) { return; }

      if (document.querySelector('input.binary-editor') || document.querySelector('input.register-editor')) {
        return;
      }

      const cellValue = cell.getValue();
      const key = evt.key.toLowerCase();
      let newContent: string | null = null;

      if (isAddress) {
        if (key === 'd') {
          newContent = parseInt(cellValue, 16).toString();
          activeKey = 'd';
        } else if (key === 'b') {
          newContent = parseInt(cellValue, 16).toString(2);
          activeKey = 'b';
        }
      } else if (cell.getField().startsWith('value')) {
        if (key === 'd') {
          newContent = parseInt(cellValue, 2).toString();
          activeKey = 'd';
        } else if (key === 'h') {
          newContent = parseInt(cellValue, 2).toString(16).toUpperCase();
          activeKey = 'h';
        }
      }

      if (newContent !== null && valueElement) {
        isConverted = true;
        valueElement.innerHTML = newContent;
      }
    };

    const keyUpHandler = (evt: KeyboardEvent) => {
      if (activeKey && evt.key.toLowerCase() === activeKey && isConverted && valueElement) {
        isConverted = false;
        activeKey = null;
        valueElement.innerHTML = originalContent;
      }
    };

    cellElement.addEventListener('mouseenter', () => {
      if (valueElement) {
        originalContent = valueElement.innerHTML;
      }
      document.addEventListener('keydown', keyDownHandler);
      document.addEventListener('keyup', keyUpHandler);
    });

    cellElement.addEventListener('mouseleave', () => {
      document.removeEventListener('keydown', keyDownHandler);
      document.removeEventListener('keyup', keyUpHandler);
      if (isConverted && valueElement) {
        isConverted = false;
        activeKey = null;
        valueElement.innerHTML = originalContent;
      }
    });
  };

  public importMemory(content: string): void {
    const heapRow = this.table.getRows().find(row => {
      const info = row.getData().info;
      return info && info.includes("Heap");
    });
    if (!heapRow) {
      return;
    }
   
    const heapAddress = parseInt(heapRow.getData().address, 16);
  
    const lines = content
      .split("\n")
      .map(line => line.trim())
      .filter(line => line !== "");
  
    const newData: any[] = [];
  
    for (const line of lines) {
      const parts = line.split(':');
      if (parts.length !== 2) {
        console.error(`Invalid format in line: ${line}`);
        return;
      }
  
      const address = parseInt(parts[0].trim(), 16);
      // if address is less than heap address, it is an instruction
      if (address < heapAddress) {
        throw new Error("Cannot import data into the instruction reserved area. Invalid address: " + parts[0].trim());
        return;
      }
  
      const binaryValue = parts[1].trim();
  
      if (binaryValue.length !== 32 || !/^[01]+$/.test(binaryValue)) {
        console.error(`Invalid value in line ${line}`);
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

  public uploadMemory(memory: string[], codeSize: number, symbols: any[]) {
    const memorySize = memory.length;
    chunk(memory, 4).forEach((word, index) => {
      const address = intToHex(index * 4).toUpperCase();
      // debugger;
      this.table.updateOrAddRow(
        address,
        {
          "address": address,
          "value0": word[3], "value1": word[2],
          "value2": word[1], "value3": word[0],
          "info": "",
          "hex": word
          .map(byte => binaryToHex(byte).toUpperCase().padStart(2, "0"))
          .join("-")
        });
      if (index * 4 < codeSize) {
        this.table.getRow(address).getElement().style.backgroundColor = "#FFF6E5";
      }

    });
    // heap label
    const heapAddress = codeSize;
    const heapAddressHex = intToHex(heapAddress).toUpperCase();
    this.table.updateOrAddRow(
      heapAddressHex,
      {
        "info": `<span class="info-column-mem-table">Heap</span>`
      }
    );
    // sp label
    const spAddressHex = intToHex(memorySize - 4).toUpperCase();
    this.table.updateOrAddRow(
      spAddressHex,
      {
        "info": `<span class="info-column-mem-table">sp</span>`
      }
    );
    this.sp = spAddressHex;

    // this.labels = new Array(this.table.getDataCount()).fill("");
    // code labels
    Object.values(symbols).forEach((symbol: any) => {
      const address = symbol.memdef;
      const memdefHex = intToHex(address).toUpperCase();
      this.table.updateOrAddRow(
        memdefHex,
        {
          "info": `<span class="info-column-mem-table">${symbol.name}</span>`
        }
      );
    });

    setTimeout(() => {
      this.updatePC(0);
    }, 200);

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
    this.sp = mem[words - 1].address;
    mem.forEach((i) => { this.table.addRow(i, true); });
  }


  public filterMemoryTableData(searchValue: string): void {
    this.resetMemoryCellColors();
    this.table.clearFilter(true);

    const searchTerms = searchValue.split(/\s+/);

    this.table.setFilter((data: any) => {
      const addr = data.address?.toLowerCase() || '';
      const value3 = data.value3?.toLowerCase() || '';
      const value2 = data.value2?.toLowerCase() || '';
      const value1 = data.value1?.toLowerCase() || '';
      const value0 = data.value0?.toLowerCase() || '';
      const hex = data.hex?.toLowerCase() || '';

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