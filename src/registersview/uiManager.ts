function getElement<T extends HTMLElement>(id: string): T {
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

    this.thirdColumn = getElement<HTMLDivElement>('thirdColumn');
    this.openSearchButton = getElement<HTMLButtonElement>('openSearchButton');
    this.openSearch = getElement<HTMLDivElement>('openSearch');
    this.stageThreeHelp = getElement<HTMLDivElement>('stageThreeHelp');
    this.manualConfig = getElement<HTMLDivElement>('manualConfig');
    this.readOnlyConfig = getElement<HTMLDivElement>('readOnlyConfig');
    this.openSettingsButton = getElement<HTMLButtonElement>('openSettingsButton');
  }

  public initializeTopButtons(): void {
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

  public configuration() {
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
  public simulationStarted() {
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
