function getElementOrLog<T extends HTMLElement>(id: string): T {
  const element = document.getElementById(id) as T | null;
  if (!element) {
    throw new Error(`Element ${id} not found`);
  }
  return element;
}

export class UIManager {

  public static instance: UIManager | undefined;

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

  readonly thirdColumn: HTMLDivElement;
  readonly openSearchButton: HTMLButtonElement;
  readonly openSearch: HTMLDivElement;
  readonly stageThreeHelp: HTMLDivElement;
  readonly manualConfig: HTMLDivElement;
  readonly readOnlyConfig: HTMLDivElement;
  readonly openSettingsButton: HTMLButtonElement;

  private _isSimulating: boolean;
  get isSimulating(): boolean {
    return this._isSimulating;
  }

  public static getInstance(): UIManager {
    if (!this.instance) {
      this.instance = new UIManager();
    }
    return this.instance;
  }

  private constructor() {
    this._isSimulating = false;

    this.registerTab = getElementOrLog<HTMLDivElement>('tabs-registers');
    this.memoryTab = getElementOrLog<HTMLDivElement>('tabs-memory');
    this.settingsButton =
      getElementOrLog<HTMLButtonElement>('openSettingsButton');
    this.convertButton =
      getElementOrLog<HTMLButtonElement>('openConvertButton');
    this.openConvert = getElementOrLog<HTMLDivElement>('openConvert1');
    this.openHelpButton = getElementOrLog<HTMLButtonElement>('openHelpButton');
    this.openHelp = getElementOrLog<HTMLDivElement>('openHelp');
    this.stageOneHelp = getElementOrLog<HTMLDivElement>('stageOneHelp');
    this.stageTwoHelp = getElementOrLog<HTMLDivElement>('stageTwoHelp');
    this.openSettings = getElementOrLog<HTMLDivElement>('openSettings');

    this.thirdColumn = getElementOrLog<HTMLDivElement>('thirdColumn');
    this.openSearchButton =
      getElementOrLog<HTMLButtonElement>('openSearchButton');
    this.openSearch = getElementOrLog<HTMLDivElement>('openSearch');
    this.stageThreeHelp = getElementOrLog<HTMLDivElement>('stageThreeHelp');
    this.manualConfig = getElementOrLog<HTMLDivElement>('manualConfig');
    this.readOnlyConfig = getElementOrLog<HTMLDivElement>('readOnlyConfig');
    this.openSettingsButton =
      getElementOrLog<HTMLButtonElement>('openSettingsButton');
  }

  public simulationStarted() {
    this.registerTab.classList.remove('hidden');
    this.memoryTab.classList.remove('hidden');
    this.settingsButton.classList.remove('hidden');
    this.convertButton.classList.add('hidden');
    this.convertButton.classList.remove('bg-active');
    this.openHelpButton.classList.remove('bg-active');
    this.settingsButton.classList.add('bg-active');
    this.openConvert.className = 'hidden';
    this.openHelp.className = 'hidden';
    this.stageOneHelp.className = 'hidden';
    this.stageTwoHelp.classList.remove('hidden');
    this.openSettings.classList.remove('hidden');
  }
  public sim() {
    this._isSimulating = true;
    this.openSettings.className = 'hidden';
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
    this.readOnlyConfig.classList.remove('hidden');
  }
}
