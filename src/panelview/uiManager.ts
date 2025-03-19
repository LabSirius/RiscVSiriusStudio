import { MemoryTable } from "./memoryTable";
import { RegistersTable } from "./registersTable/registersTable";

function getElement<T extends HTMLElement>(id: string): T {
  const element = document.getElementById(id) as T | null;
  if (!element) {
    throw new Error(`Element ${id} not found`);
  }
  return element;
}

export class UIManager {

  public static instance: UIManager | undefined;

  private _memoryTable: MemoryTable | undefined;
  get memoryTable(): MemoryTable {
    if (!this._memoryTable) {
      throw new Error('Memory table not initialized');
    }
    return this._memoryTable;
  }

  private _registersTable: RegistersTable | undefined;
  get registersTable(): RegistersTable {
    if (!this._registersTable) {
      throw new Error('Registers table not initialized');
    }
    return this._registersTable;
  }

  private readonly sendMessagetoExtension: (msg: any) => void;

  // readonly pcIcon: HTMLButtonElement;

  // readonly memorySizeInput: HTMLInputElement;

  // readonly searchRegisterInput: HTMLInputElement;
  // readonly searchMemoryInput: HTMLInputElement;

  // readonly importRegisterBtn: HTMLButtonElement;
  // readonly fileInputImportRegister: HTMLInputElement;

  // readonly importMemoryBtn: HTMLButtonElement;
  // readonly fileInputImportMemory: HTMLInputElement;

  // readonly checkShowHexadecimal: HTMLInputElement;

  private getMemoryCells(rowElement: HTMLElement): {
    cell3?: HTMLElement;
    cell2?: HTMLElement;
    cell1?: HTMLElement;
    cell0?: HTMLElement;
  } {
    return {
      cell3: rowElement.querySelector('div.tabulator-cell[tabulator-field="value3"]') as HTMLElement,
      cell2: rowElement.querySelector('div.tabulator-cell[tabulator-field="value2"]') as HTMLElement,
      cell1: rowElement.querySelector('div.tabulator-cell[tabulator-field="value1"]') as HTMLElement,
      cell0: rowElement.querySelector('div.tabulator-cell[tabulator-field="value0"]') as HTMLElement,
    };
  }
 

  private _isSimulating: boolean;
  get isSimulating(): boolean {
    return this._isSimulating;
  }

  public static createInstance(sendMessagetoExtension: (msg: any) => void): UIManager {
    if (!this.instance) {
      this.instance = new UIManager(sendMessagetoExtension);
    }
    return this.instance;
  }

  public static getInstance(): UIManager {
    if (!this.instance) {
      throw new Error('UIManager not initialized');
    } else {
      return this.instance;
    }
  }

  private constructor(sendMessagetoExtension: (msg: any) => void) {
    this._isSimulating = false;
    this._registersTable = undefined;
    this._memoryTable = undefined;
   

    this.sendMessagetoExtension = sendMessagetoExtension;

    // this.pcIcon = getElement<HTMLButtonElement>('pcIcon');
    // this.memorySizeInput = getElement<HTMLInputElement>('memorySizeInput');

    // this.searchRegisterInput = getElement<HTMLInputElement>('searchRegisterInput');
    // this.searchMemoryInput = getElement<HTMLInputElement>('searchMemoryInput');

    // this.importRegisterBtn = getElement<HTMLButtonElement>('importRegisterBtn');
    // this.fileInputImportRegister = getElement<HTMLInputElement>('fileInputImportRegister');

    // this.importMemoryBtn = getElement<HTMLButtonElement>('importMemoryBtn');
    // this.fileInputImportMemory = getElement<HTMLInputElement>('fileInputImportMemory');

    // this.checkShowHexadecimal = getElement<HTMLInputElement>('checkShowHexadecimal');

    // this.searchInRegistersTable();
    // this.searchInMemoryTable();
    // this.showPC();
    // this.initRegisterImport();
    // this.initMemoryImport();
    // this.setUpSettings();
  }

  public uploadMemory(
    memory: string[], codeSize: number, symbols: any[]): void {
    this._registersTable = new RegistersTable;
    this._memoryTable = new MemoryTable(memory, codeSize, symbols, this.sendMessagetoExtension); 
    //this.showHexadecimalInMemory();
    //this.assignMemoryInputValue(memory.length-codeSize);
    //this.configuration();
    this.memoryTable.uploadMemory(memory, codeSize, symbols);
  }

  // private showPC(): void {
  //   this.pcIcon.addEventListener('click', () => {
  //     const targetValue = (this.memoryTable.pc * 4).toString(16).toUpperCase();
  //     this.memoryTable.table.scrollToRow(targetValue, "center", true);
  //   });
  // }

  // private assignMemoryInputValue(value: number){
  //   this.memorySizeInput.value = value.toString();
  // }

  public step(pc: number, log: (object: any, level?: string) => void): void {
    log({ msg: "Simulator reported step" });
    if (!this.isSimulating) {
      this.simulationStarted();
      this.disableEditors();
    }
    this.memoryTable.updatePC(pc);
  }

  public disableEditors(): void {
    this.memoryTable.table.getColumns().forEach(column => {
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

    this.registersTable.table.getColumns().forEach(column => {
      const def = column.getDefinition();
      if (def.field && def.field.startsWith("value")) {
        column.updateDefinition({
          ...def,
          editor: undefined,
          editable: () => false
        });
      }
    });
  }


  public setMemoryCell(address: number, leng: number, value: string): void {
    const rowStart = address - (address % 4);
    const hexRowStart = rowStart.toString(16).toUpperCase();
    
    const row = this.memoryTable.table.getRow(hexRowStart);
    if (!row) { return; }
    
    const rowElement = row.getElement();
    const { cell3, cell2, cell1, cell0 } = this.getMemoryCells(rowElement);
    
    let newData: Partial<{ value3: string; value2: string; value1: string; value0: string }> = {};
    
    if (leng === 1) {
      const segment = value.substring(24, 32);
      newData.value0 = segment;
      if (cell0) {
        cell0.textContent = segment;
        cell0.style.fontWeight = '580';
        cell0.style.color = "#3A6973";
      }
    } else if (leng === 2) {
      const lower16 = value.substring(16, 32);
      const segment1 = lower16.substring(0, 8);
      const segment0 = lower16.substring(8, 16);
      newData.value1 = segment1;
      newData.value0 = segment0;
      if (cell1) {
        cell1.textContent = segment1;
        cell1.style.fontWeight = '580';
        cell1.style.color = "#3A6973";
      }
      if (cell0) {
        cell0.textContent = segment0;
        cell0.style.fontWeight = '580';
        cell0.style.color = "#3A6973";
      }
    } else if (leng === 4) {
      const segment3 = value.substring(0, 8);
      const segment2 = value.substring(8, 16);
      const segment1 = value.substring(16, 24);
      const segment0 = value.substring(24, 32);
      newData.value3 = segment3;
      newData.value2 = segment2;
      newData.value1 = segment1;
      newData.value0 = segment0;
      if (cell3) {
        cell3.textContent = segment3;
        cell3.style.fontWeight = '580';
        cell3.style.color = "#3A6973";
      }
      if (cell2) {
        cell2.textContent = segment2;
        cell2.style.fontWeight = '580';
        cell2.style.color = "#3A6973";
      }
      if (cell1) {
        cell1.textContent = segment1;
        cell1.style.fontWeight = '580';
        cell1.style.color = "#3A6973";
      }
      if (cell0) {
        cell0.textContent = segment0;
        cell0.style.fontWeight = '580';
        cell0.style.color = "#3A6973";
      }
    }
    
    row.update(newData);
    const currentData = row.getData();
    const hexParts = ['value3', 'value2', 'value1', 'value0'].map(field => {
      const binary = currentData[field];
      return parseInt(binary, 2).toString(16).padStart(2, '0');
    });
    const hexValue = hexParts.join('-').toUpperCase();
    row.update({ hex: hexValue });
    
    this.animateMemorycell(address, leng);
  }
  

  public animateMemorycell(address: number, leng: number): void {
    const hexAddress = address.toString(16).toUpperCase();
    const row = this.memoryTable.table.getRow(hexAddress);
    
    if (row) {
      const rowElement = row.getElement();
      
      const binaryCells = Array.from(
        rowElement.querySelectorAll('div.tabulator-cell[tabulator-field^="value"]')
      );
      let cellsToAnimate: Element[] = [];
      if (leng === 4) {
        cellsToAnimate = binaryCells;
      } else if (leng === 2) {
        cellsToAnimate = binaryCells.slice(-2);
      } else if (leng === 1) {
        cellsToAnimate = binaryCells.slice(-1);
      }
      
      cellsToAnimate.forEach(cell => cell.classList.add('animate-cell'));

      setTimeout(() => {
        cellsToAnimate.forEach(cell => cell.classList.remove('animate-cell'));
      }, 500);
    }

    this.memoryTable.table.scrollToRow(hexAddress, "center", true);
  }

  public resetUI(): void {
    this._isSimulating = false;

  }



  private simulationStarted() {
    this._isSimulating = true;

  }

  //  searchInRegistersTable() {
  //   this.searchRegisterInput.addEventListener('input', () => {
  //     const input = this.searchRegisterInput.value.trim();
  //     if (input === '') {
  //       this.registersTable.table.clearFilter(true);
  //       this.registersTable.resetCellColors();
  //       return;
  //     }
  //     this.registersTable.filterTableData(input);
  //   });

  //   this.searchRegisterInput.addEventListener('keydown', (event: KeyboardEvent) => {
  //     if (event.key === 'Escape') {
  //       this.searchRegisprivateterInput.value = '';
  //       this.registersTable.table.clearFilter(true);
  //       this.registersTable.resetCellColors();
  //     }
  //   });
  // }

  // private searchInMemoryTable(): void {

  //   this.searchMemoryInput.addEventListener('input', () => {
  //     const searchValue = this.searchMemoryInput.value.trim().toLowerCase();


  //     this.memoryTable.table.clearFilter(true);
  //     this.memoryTable.resetMemoryCellColors();
  //     this.memoryTable.table.redraw(true);

  //     if (searchValue === '') {
  //       this.memoryTable.table.clearFilter(true);
  //       this.memoryTable.resetMemoryCellColors();
  //       return;
  //     }
  //     this.memoryTable.filterMemoryTableData(searchValue);
  //   });

  //   this.searchMemoryInput.addEventListener('keydown', (event: KeyboardEvent) => {
  //     if (event.key === 'Escape') {
  //       this.searchMemoryInput.value = '';
  //       this.memoryTable.table.clearFilter(true);
  //       this.memoryTable.resetMemoryCellColors();
  //     }
  //   });
  // }

  // private initRegisterImport(): void {

  //   this.importRegisterBtn
  //     .addEventListener("click", () => {
  //       document.getElementById("fileInputImportRegister")?.click();
  //     });

  //   this.fileInputImportRegister
  //     .addEventListener("change", (event) => {
  //       const input = event.target as HTMLInputElement;
  //       const file = input.files?.[0];

  //       if (!file) {
  //         return;
  //       }

  //       const reader = new FileReader();

  //       reader.onload = (e) => {
  //         if (!e.target?.result) {
  //           return;
  //         }
  //         const content = e.target.result as string;
  //         this.registersTable.importRegisters(content);
  //       };

  //       reader.readAsText(file);
  //     });
  // }

  // private initMemoryImport(): void {

  //   this.importMemoryBtn
  //     .addEventListener('click', () => {
  //       this.fileInputImportMemory.click();
  //     });

  //   this.fileInputImportMemory
  //     .addEventListener('change', (event) => {
  //       const input = event.target as HTMLInputElement;
  //       const file = input.files?.[0];

  //       if (!file) {
  //         return;
  //       }

  //       const reader = new FileReader();

  //       reader.onload = (e) => {
  //         if (!e.target?.result) {
  //           return;
  //         }
  //         const content = e.target.result as string;

  //         const lines = content
  //           .split('\n')
  //           .map(line => line.trim())
  //           .filter(line => line !== '');

  //         if (lines.length === 0) {
  //           console.log('Empty file');
  //           return;
  //         }

  //         const invalidLine = lines.find(line => !line.includes(':'));
  //         if (invalidLine) {
  //           console.log(`Invalid format in line ${invalidLine}`);
  //           return;
  //         }

  //         this.memoryTable.importMemory(content);
  //       };

  //       reader.readAsText(file);
  //     });
  // }

  // private showHexadecimalInMemory(): void {

  //   console.log("Show hexadecimal in memory ENTROOO");
   
  //   const toggleColumn = () => {
  //     console.log("ENTROOO");
  //     const column = this.memoryTable.table.getColumn("hex");
  //     if (column) {
  //       this.checkShowHexadecimal.checked ? column.show() : column.hide();
  //     } else {
  //       console.log("Column not found");
  //     }
  //   };
  //   this.checkShowHexadecimal.addEventListener("change", toggleColumn);
  //   toggleColumn();
    
    
  // }

  // private setUpSettings() {
  //   this.memorySizeInput.addEventListener('change', () => {
  //     this.memorySizeInput.disabled = true;
  //     let intValue = Number.parseInt(this.memorySizeInput.value);
  //     if (intValue < 32 || this.memorySizeInput.value === '') {
  //       this.memorySizeInput.value = '32';
  //     }else if (intValue > 512) {
  //       this.memorySizeInput.value = '512';
  //     }

  //     if (intValue % 4 !== 0) {
  //       intValue = Math.floor(intValue / 4) * 4;
  //       this.memorySizeInput.value = intValue.toString();
  //     }

  //     const value = Number(this.memorySizeInput.value) + Number(this.memoryTable.codeAreaEnd-4);
  //     this.sendMessagetoExtension({
  //       command: 'event',
  //       object: { event: 'memorySizeChanged', value: value}
  //     });
  //     const newSize = Number.parseInt(this.memorySizeInput.value);    });
  // }
  
}
