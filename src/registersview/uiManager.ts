import { MemoryTable } from "./memoryTable";
import { RegistersTable } from "./registersTable/registersTable";
import { Converter } from "./convertTool";




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

  private _registersTable: RegistersTable;
  get registersTable(): RegistersTable {
    return this._registersTable;
  }

  private readonly sendMessagetoExtension: (msg: any) => void;

  readonly registerTab: HTMLDivElement;
  readonly memoryTab: HTMLDivElement;

  readonly pcIcon: HTMLButtonElement;
  readonly settingsButton: HTMLButtonElement;
  readonly convertButton: HTMLButtonElement;
  readonly openConvert: HTMLDivElement;
  readonly openHelpButton: HTMLButtonElement;
  readonly openHelp: HTMLDivElement;
  readonly stageOneHelp: HTMLDivElement;
  readonly stageTwoHelp: HTMLDivElement;
  readonly openSettings: HTMLDivElement;

  readonly shortcutsHelp: HTMLDivElement;

  readonly toolsPanel: HTMLDivElement;
  readonly openSearchButton: HTMLButtonElement;
  readonly openSearch: HTMLDivElement;
  readonly stageThreeHelp: HTMLDivElement;

  readonly memorySizeInput: HTMLInputElement;
  readonly manualConfig: HTMLDivElement;
  readonly openSettingsButton: HTMLButtonElement;

  readonly searchRegisterInput: HTMLInputElement;
  readonly searchMemoryInput: HTMLInputElement;

  readonly importRegisterBtn: HTMLButtonElement;
  readonly fileInputImportRegister: HTMLInputElement;

  readonly importMemoryBtn: HTMLButtonElement;
  readonly fileInputImportMemory: HTMLInputElement;

  readonly checkShowHexadecimal: HTMLInputElement;

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
    this._registersTable = new RegistersTable();
    this._memoryTable = undefined;
    new Converter();

    this.sendMessagetoExtension = sendMessagetoExtension;


    this.registerTab = getElement<HTMLDivElement>('tabs-registers');
    this.memoryTab = getElement<HTMLDivElement>('tabs-memory');

    this.pcIcon = getElement<HTMLButtonElement>('pcIcon');
    this.settingsButton = getElement<HTMLButtonElement>('openSettingsButton');
    this.convertButton = getElement<HTMLButtonElement>('openConvertButton');
    this.openConvert = getElement<HTMLDivElement>('openConvert1');
    this.openHelpButton = getElement<HTMLButtonElement>('openHelpButton');
    this.openHelp = getElement<HTMLDivElement>('openHelp');
    this.stageOneHelp = getElement<HTMLDivElement>('stageOneHelp');
    this.stageTwoHelp = getElement<HTMLDivElement>('stageTwoHelp');
    this.openSettings = getElement<HTMLDivElement>('openSettings');

    this.shortcutsHelp = getElement<HTMLDivElement>('shortcutsHelp');

    this.toolsPanel = getElement<HTMLDivElement>('toolsPanel');
    this.openSearchButton = getElement<HTMLButtonElement>('openSearchButton');
    this.openSearch = getElement<HTMLDivElement>('openSearch');
    this.stageThreeHelp = getElement<HTMLDivElement>('stageThreeHelp');
    this.memorySizeInput = getElement<HTMLInputElement>('memorySizeInput');
    this.manualConfig = getElement<HTMLDivElement>('manualConfig');

    this.openSettingsButton = getElement<HTMLButtonElement>('openSettingsButton');

    this.searchRegisterInput = getElement<HTMLInputElement>('searchRegisterInput');
    this.searchMemoryInput = getElement<HTMLInputElement>('searchMemoryInput');

    this.importRegisterBtn = getElement<HTMLButtonElement>('importRegisterBtn');
    this.fileInputImportRegister = getElement<HTMLInputElement>('fileInputImportRegister');

    this.importMemoryBtn = getElement<HTMLButtonElement>('importMemoryBtn');
    this.fileInputImportMemory = getElement<HTMLInputElement>('fileInputImportMemory');

    this.checkShowHexadecimal = getElement<HTMLInputElement>('checkShowHexadecimal');



    this.initializeTopButtons();
    this.searchInRegistersTable();
    this.searchInMemoryTable();
    this.showPC();
    this.initRegisterImport();
    this.initMemoryImport();
    this.setUpSettings();
    this.setUpHelp();
  }

  public uploadMemory(
    memory: string[], codeSize: number, symbols: any[]): void {
    this._memoryTable = new MemoryTable(memory, codeSize, symbols, this.sendMessagetoExtension); 
    this.showHexadecimalInMemory();
    this.assignMemoryInputValue(memory.length-codeSize);
    this.configuration();
    this.memoryTable.uploadMemory(memory, codeSize, symbols);
  }

  private showPC(): void {
    this.pcIcon.addEventListener('click', () => {
      const targetValue = (this.memoryTable.pc * 4).toString(16).toUpperCase();
      this.memoryTable.table.scrollToRow(targetValue, "center", true);
    });
  }

  private assignMemoryInputValue(value: number){
    this.memorySizeInput.value = value.toString();
  }

  public step(pc: number, log: (object: any, level?: string) => void): void {
    log({ msg: "Simulator reported step" });
    if (!this.isSimulating) {
      this.simulationStarted();
      this.memoryTable.disableEditors();
    }
    this.memoryTable.updatePC(pc);
  }

  private initializeTopButtons(): void {
    const sections: { [key: string]: HTMLElement } = {
      openSearch: this.openSearch,
      openSettings: this.openSettings,
      openConvert1: this.openConvert,
      openHelp: this.openHelp,
    };

    const buttons: { [key: string]: HTMLElement } = {
      openSearchButton: this.openSearchButton,
      openSettingsButton: this.openSettingsButton,
      openConvertButton: this.convertButton,
      openHelpButton: this.openHelpButton,
    };

    const showOnly = (targetId: keyof typeof sections, buttonId: keyof typeof buttons) => {
      Object.entries(sections).forEach(([id, element]) => {
        element.className =
          id === targetId
            ? 'flex flex-1 flex-col max-h-dvh min-h-dvh overflow-y-scroll'
            : 'hidden';
      });
      Object.values(buttons).forEach((btn) => btn.classList.remove('bg-active'));
      buttons[buttonId].classList.add('bg-active');
    };

    this.openSearchButton.addEventListener('click', () =>
      showOnly('openSearch', 'openSearchButton')
    );
    this.openSettingsButton.addEventListener('click', () =>
      showOnly('openSettings', 'openSettingsButton')
    );
    this.convertButton.addEventListener('click', () =>
      showOnly('openConvert1', 'openConvertButton')
    );
    this.openHelpButton.addEventListener('click', () =>
      showOnly('openHelp', 'openHelpButton')
    );
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
  

  private showtables(){
    this.registerTab.classList.remove('hidden');
    this.memoryTab.classList.remove('hidden');
  }
  private ocultTables(){
    this.registerTab.classList.add('hidden');
    this.memoryTab.classList.add('hidden');
  }

  private showConvert(){
    this.convertButton.classList.remove('hidden');
    this.openConvert.className = 'flex flex-1 flex-col max-h-dvh min-h-dvh overflow-y-scroll';
    this.convertButton.classList.add('bg-active');
  } 
  private ocultConvert(){
    this.convertButton.classList.add('hidden');
    this.convertButton.classList.remove('bg-active');
    this.openConvert.className = 'hidden';
  }

  private showSearch() {
    this.openSearch.classList.remove('hidden');
    this.openSearchButton.classList.remove('hidden');
    this.openSearchButton.classList.add('bg-active');
  }
  private ocultSearch(){
    this.openSearchButton.classList.add('hidden');
    this.openSearch.classList.add('hidden');
  }


  private showSettingsBeforeSimulating(){
    this.settingsButton.classList.add('bg-active');
    this.settingsButton.classList.remove('hidden');
    this.openSettings.classList.remove('hidden');
  }
  private settingsInSimulating() {
    this.manualConfig.classList.add('hidden');
    this.openSettingsButton.classList.remove('bg-active');
    this.openSettings.className = 'hidden';
    this.memorySizeInput.readOnly = true;
    this.memorySizeInput.classList.add('bg-disabled');
  }
  private ocultSettings(){
    this.openSettings.className = 'hidden';
    this.settingsButton.classList.add('hidden');
    this.manualConfig.classList.remove('hidden');
    this.memorySizeInput.classList.remove('bg-disabled');
    this.memorySizeInput.readOnly = false;
  }

  private  helpInConfiguration(){
    this.openHelpButton.classList.remove('bg-active');
    this.shortcutsHelp.classList.remove('hidden');
    this.openHelp.className = 'hidden';
    this.stageOneHelp.className = 'hidden';
    this.stageTwoHelp.classList.remove('hidden');
  }
  private helpInSimulating() { 
    this.openHelpButton.classList.remove('bg-active');
    this.openHelp.className = 'hidden';   
    this.stageTwoHelp.className = 'hidden';
    this.stageThreeHelp.classList.remove('hidden');
  }
  private ocultHelp(){
    this.openHelp.className = 'hidden';
    this.openHelpButton.classList.remove('bg-active');
    this.stageOneHelp.classList.remove('hidden');
    this.stageTwoHelp.classList.add('hidden');
    this.stageThreeHelp.classList.add('hidden');
    this.shortcutsHelp.classList.add('hidden');
  }



  public resetUI(): void {
    this._isSimulating = false;
    this.registersTable.reInitializeTable();
    this.memoryTable.reInitializeTable();

    this.ocultTables();
    this.showConvert();
    this.ocultSearch();
    this.ocultSettings();
    this.ocultHelp();
    this.pcIcon.classList.add('hidden');

  }

  private configuration() {
    this.showtables();
    this.ocultConvert();
    this.showSettingsBeforeSimulating();
    this.helpInConfiguration(); 
    this.pcIcon.classList.remove('hidden');
  }

  private simulationStarted() {
    this._isSimulating = true;
    this.showSearch();
    this.helpInSimulating();
    this.settingsInSimulating();
    this.convertButton.classList.remove('hidden');
  }

  private searchInRegistersTable() {
    this.searchRegisterInput.addEventListener('input', () => {
      const input = this.searchRegisterInput.value.trim();
      if (input === '') {
        this.registersTable.table.clearFilter(true);
        this.registersTable.resetCellColors();
        return;
      }
      this.registersTable.filterTableData(input);
    });

    this.searchRegisterInput.addEventListener('keydown', (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        this.searchRegisterInput.value = '';
        this.registersTable.table.clearFilter(true);
        this.registersTable.resetCellColors();
      }
    });
  }

  private searchInMemoryTable(): void {

    this.searchMemoryInput.addEventListener('input', () => {
      const searchValue = this.searchMemoryInput.value.trim().toLowerCase();


      this.memoryTable.table.clearFilter(true);
      this.memoryTable.resetMemoryCellColors();
      this.memoryTable.table.redraw(true);

      if (searchValue === '') {
        this.memoryTable.table.clearFilter(true);
        this.memoryTable.resetMemoryCellColors();
        return;
      }
      this.memoryTable.filterMemoryTableData(searchValue);
    });

    this.searchMemoryInput.addEventListener('keydown', (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        this.searchMemoryInput.value = '';
        this.memoryTable.table.clearFilter(true);
        this.memoryTable.resetMemoryCellColors();
      }
    });
  }

  private initRegisterImport(): void {

    this.importRegisterBtn
      .addEventListener("click", () => {
        document.getElementById("fileInputImportRegister")?.click();
      });

    this.fileInputImportRegister
      .addEventListener("change", (event) => {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0];

        if (!file) {
          return;
        }

        const reader = new FileReader();

        reader.onload = (e) => {
          if (!e.target?.result) {
            return;
          }
          const content = e.target.result as string;
          this.registersTable.importRegisters(content);
        };

        reader.readAsText(file);
      });
  }

  private initMemoryImport(): void {

    this.importMemoryBtn
      .addEventListener('click', () => {
        this.fileInputImportMemory.click();
      });

    this.fileInputImportMemory
      .addEventListener('change', (event) => {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0];

        if (!file) {
          return;
        }

        const reader = new FileReader();

        reader.onload = (e) => {
          if (!e.target?.result) {
            return;
          }
          const content = e.target.result as string;

          const lines = content
            .split('\n')
            .map(line => line.trim())
            .filter(line => line !== '');

          if (lines.length === 0) {
            console.log('Empty file');
            return;
          }

          const invalidLine = lines.find(line => !line.includes(':'));
          if (invalidLine) {
            console.log(`Invalid format in line ${invalidLine}`);
            return;
          }

          this.memoryTable.importMemory(content);
        };

        reader.readAsText(file);
      });
  }

  private showHexadecimalInMemory(): void {

    console.log("Show hexadecimal in memory ENTROOO");
   
    const toggleColumn = () => {
      console.log("ENTROOO");
      const column = this.memoryTable.table.getColumn("hex");
      if (column) {
        this.checkShowHexadecimal.checked ? column.show() : column.hide();
      } else {
        console.log("Column not found");
      }
    };
    this.checkShowHexadecimal.addEventListener("change", toggleColumn);
    toggleColumn();
    
    
  }

  private setUpSettings() {
    this.memorySizeInput.addEventListener('change', () => {
      if (Number.parseInt(this.memorySizeInput.value) < 32 || this.memorySizeInput.value === '') {
        this.memorySizeInput.value = '32';
      }

      const value = Number(this.memorySizeInput.value) + Number(this.memoryTable.codeAreaEnd-4);
      this.sendMessagetoExtension({
        command: 'event',
        object: { event: 'memorySizeChanged', value: value}
      });
      const newSize = Number.parseInt(this.memorySizeInput.value);
      this.memoryTable.resizeMemory(newSize);
    });

  }

  private setUpHelp() {
    const openShowCard = document.getElementById('openShowCard') as HTMLDivElement;

    openShowCard.addEventListener('click', () => {
      this.sendMessagetoExtension({
        command: 'event',
        object: { event: 'clickOpenRISCVCard', value: 'openHelp' }
      });
    });
  }


  
  
}
