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

  public memoryTable: MemoryTable;

  public registersTable: RegistersTable;

  private readonly sendMessagetoExtension: (msg: any) => void;

  readonly registerTab: HTMLDivElement;
  readonly memoryTab: HTMLDivElement;
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

  readonly memorySizeInput : HTMLInputElement;
  readonly manualConfig: HTMLDivElement;
  readonly openSettingsButton: HTMLButtonElement;

  readonly searchRegisterInput: HTMLInputElement;
  readonly searchMemoryInput: HTMLInputElement;

  readonly importRegisterBtn: HTMLButtonElement;
  readonly fileInputImportRegister: HTMLInputElement;

  readonly importMemoryBtn: HTMLButtonElement;
  readonly fileInputImportMemory: HTMLInputElement;

  readonly checkShowHexadecimal: HTMLInputElement;
 

  private _isSimulating: boolean;
  get isSimulating(): boolean {
    return this._isSimulating;
  }

  public static createInstance(sendMessagetoExtension: (msg: any) => void): UIManager {
    if (!this.instance) {
      this.instance = new UIManager( sendMessagetoExtension);
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

    this.registersTable = new RegistersTable();
    this.memoryTable = new MemoryTable();
    new Converter();

    this.sendMessagetoExtension = sendMessagetoExtension;


    this.registerTab = getElement<HTMLDivElement>('tabs-registers');
    this.memoryTab = getElement<HTMLDivElement>('tabs-memory');
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
    this.initRegisterImport();
    this.initMemoryImport();
    this.showHexadecimalInMemory();
    this.setUpSettings();
    this.setUpHelp();
  }

  public uploadMemory(
    memory: string[], codeSize: number, symbols: any[]): void {
    this.configuration();
    this.memoryTable.uploadMemory(memory, codeSize, symbols);
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

  private configuration() {
    this.registerTab.classList.remove('hidden');
    this.memoryTab.classList.remove('hidden');
    this.settingsButton.classList.remove('hidden');
    this.convertButton.classList.add('hidden');

    this.shortcutsHelp.classList.remove('hidden');
    
    this.convertButton.classList.remove('bg-active');
    this.openHelpButton.classList.remove('bg-active');
    this.settingsButton.classList.add('bg-active');
    this.openConvert.className = 'hidden';
    this.openHelp.className = 'hidden';
    this.stageOneHelp.className = 'hidden';
    this.stageTwoHelp.classList.remove('hidden');
    this.openSettings.classList.remove('hidden');
  }
  private simulationStarted() {
    this._isSimulating = true;
    this.openSettings.className = 'hidden';
    this.memorySizeInput.readOnly = true;
    this.memorySizeInput.classList.add('bg-disabled');
    this.openSearchButton.classList.remove('hidden');
    this.openSearchButton.classList.add('bg-active');
    this.openHelpButton.classList.remove('bg-active');
    this.openHelp.className = 'hidden';
    this.openSettingsButton.classList.remove('bg-active');
    this.convertButton.classList.remove('hidden');
    this.openSearch.classList.remove('hidden');
    this.stageTwoHelp.className = 'hidden';
    this.stageThreeHelp.classList.remove('hidden');
    this.manualConfig.classList.add('hidden');

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
    const toggleColumn = () => {
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

  private setUpSettings(){
    this.memorySizeInput.addEventListener('change', () => {
      if (Number.parseInt(this.memorySizeInput.value) < 32) {
        this.memorySizeInput .value = '32';
      }
      this.sendMessagetoExtension({
        command: 'event',
        object: { event: 'memorySizeChanged', value: this.memorySizeInput .value }
      });
      const newSize = Number.parseInt(this.memorySizeInput .value);
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


  public resetUI(): void {

    this._isSimulating = false;
    this.registersTable.reInitializeTable();
    this.memoryTable.reInitializeTable();

    this.registerTab.classList.add('hidden');
    this.memoryTab.classList.add('hidden');

    this.convertButton.classList.remove('hidden');
    this.openConvert.className = 'flex flex-1 flex-col max-h-dvh min-h-dvh overflow-y-scroll';
    this.convertButton.classList.add('bg-active');


    this.openSearchButton.classList.add('hidden');
    this.openSearch.classList.add('hidden');

    this.memorySizeInput.classList.remove('bg-disabled');
    this.memorySizeInput.readOnly = false;

    this.openSettings.className = 'hidden';
    this.settingsButton.classList.add('hidden');
    this.manualConfig.classList.remove('hidden');

    this.openHelp.className = 'hidden';
    this.openHelpButton.classList.remove('bg-active');
    this.stageOneHelp.classList.remove('hidden');
    this.stageTwoHelp.classList.add('hidden');
    this.stageThreeHelp.classList.add('hidden');
    this.shortcutsHelp.classList.add('hidden');

  }
  
}
