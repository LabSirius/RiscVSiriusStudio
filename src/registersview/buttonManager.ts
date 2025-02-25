export class TopButtonManager {
    private sections: string[];
    private buttons: string[];
  
    constructor() {
      this.sections = ['openSearch', 'openSettings', 'openConvert1', 'openHelp'];
      this.buttons = ['openSearchButton', 'openSettingsButton', 'openConvertButton', 'openHelpButton'];
      this.addEventListeners();
    }

    private showOnly(targetId: string, buttonId: string): void {
      this.sections.forEach((id) => {
        const element = document.getElementById(id) as HTMLElement;
        element.className =
          id === targetId
            ? 'flex flex-1 flex-col max-h-dvh min-h-dvh overflow-y-scroll'
            : 'hidden';
      });
      this.buttons.forEach((btnId) => {
        document.getElementById(btnId)?.classList.remove('bg-active');
      });
      document.getElementById(buttonId)?.classList.add('bg-active');
    }
  
    private addEventListeners(): void {
      document.getElementById('openSearchButton')?.addEventListener('click', () =>
        this.showOnly('openSearch', 'openSearchButton')
      );
      document.getElementById('openSettingsButton')?.addEventListener('click', () =>
        this.showOnly('openSettings', 'openSettingsButton')
      );
      document.getElementById('openConvertButton')?.addEventListener('click', () =>
        this.showOnly('openConvert1', 'openConvertButton')
      );
      document.getElementById('openHelpButton')?.addEventListener('click', () =>
        this.showOnly('openHelp', 'openHelpButton')
      );
    }
  }
  

  