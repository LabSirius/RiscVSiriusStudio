import {
  provideVSCodeDesignSystem,
  allComponents
} from '@vscode/webview-ui-toolkit';

import {
  CellComponent,
  GroupComponent,
  RowComponent,
  TabulatorFull as Tabulator
} from 'tabulator-tables';

import { registersSetup, setupImportRegisters, setupSearchInRegisterTable } from './registersTable';
import { memorySetup, setupImportMemory, setUpMemoryConfig, enterInstructionsInMemoryTable } from './memoryTable';
import { setUpConvert } from './convertTool';
import { Console } from 'console';
provideVSCodeDesignSystem().register(allComponents);

const vscode = acquireVsCodeApi();
window.addEventListener('load', main, { passive: true });

/**
 * Log functionality. The logger that is actually used is in the extension. This
 * function sends the message to the extension with all the information required
 * to log it.
 *
 * @param level logging level.
 * @param object the object to be logged
 */
function log(object: any = {}, level: string = 'info') {
  sendMessageToExtension({ level: level, command: 'log', object: object });
}

function main() {
  let registersTable = registersSetup();
  let memoryTable = memorySetup();
  window.addEventListener('message', (event) => {
    dispatch(event, registersTable, memoryTable);
  });

  setupButtons();
  setupSearchInRegisterTable(registersTable);
  setUpMemoryConfig(memoryTable);
  setupImportRegisters(registersTable);
  setupImportMemory(memoryTable);
  setUpConvert();
  setupSettings();
  setUpHelp();
}



function dispatch(
  event: MessageEvent,
  registersTable: Tabulator,
  memoryTable: Tabulator
) {
  log({ msg: 'Dispatching message', data: event.data });

  const data = event.data;

  // Función auxiliar para obtener un elemento por su ID y avisar si no existe
  function getElementOrLog<T extends HTMLElement>(id: string): T | null {
    const element = document.getElementById(id) as T | null;
    if (!element) {
      console.error(`No se encontró el elemento con id: ${id}`);
    }
    return element;
  }

  if (data.command === 'simulateClicked') {
    handleSimulateClicked();
    const irValue = data.ir;
    enterInstructionsInMemoryTable(memoryTable, irValue.instructions, irValue.symbols);
  } else if (data.command === 'nextStepClicked') {
    handleNextStepClicked();

  }

  function handleSimulateClicked(): void {
    const registerTab = getElementOrLog<HTMLDivElement>('tabs-registers');
    const memoryTab = getElementOrLog<HTMLDivElement>('tabs-memory');
    const settingsButton =
      getElementOrLog<HTMLButtonElement>('openSettingsButton');
    const convertButton =
      getElementOrLog<HTMLButtonElement>('openConvertButton');
    const openConvert = getElementOrLog<HTMLDivElement>('openConvert1');
    const openHelpButton = getElementOrLog<HTMLButtonElement>('openHelpButton');
    const openHelp = getElementOrLog<HTMLDivElement>('openHelp');
    const stageOneHelp = getElementOrLog<HTMLDivElement>('stageOneHelp');
    const stageTwoHelp = getElementOrLog<HTMLDivElement>('stageTwoHelp');
    const openSettings = getElementOrLog<HTMLDivElement>('openSettings');

    if (
      registerTab &&
      memoryTab &&
      settingsButton &&
      convertButton &&
      openConvert &&
      openHelp &&
      stageOneHelp &&
      stageTwoHelp &&
      openSettings &&
      openHelpButton
    ) {
      registerTab.classList.remove('hidden');
      memoryTab.classList.remove('hidden');
      settingsButton.classList.remove('hidden');
      convertButton.classList.add('hidden');
      convertButton.classList.remove('bg-active');
      openHelpButton.classList.remove('bg-active');
      settingsButton.classList.add('bg-active');
      openConvert.className = 'hidden';
      openHelp.className = 'hidden';
      stageOneHelp.className = 'hidden';
      stageTwoHelp.classList.remove('hidden');
      openSettings.classList.remove('hidden');
    }
  }

  function handleNextStepClicked(): void {
    const thirdColumn = getElementOrLog<HTMLDivElement>('thirdColumn');
    const openSettings = getElementOrLog<HTMLDivElement>('openSettings');
    const openSearchButton =
      getElementOrLog<HTMLButtonElement>('openSearchButton');
    const openHelpButton = getElementOrLog<HTMLButtonElement>('openHelpButton');
    const openHelp = getElementOrLog<HTMLDivElement>('openHelp');
    const convertButton =
      getElementOrLog<HTMLButtonElement>('openConvertButton');
    const openSearch = getElementOrLog<HTMLDivElement>('openSearch');
    const stageTwoHelp = getElementOrLog<HTMLDivElement>('stageTwoHelp');
    const stageThreeHelp = getElementOrLog<HTMLDivElement>('stageThreeHelp');
    const manualConfig = getElementOrLog<HTMLDivElement>('manualConfig');
    const readOnlyConfig = getElementOrLog<HTMLDivElement>('readOnlyConfig');
    const openSettingsButton =
      getElementOrLog<HTMLButtonElement>('openSettingsButton');

    if (thirdColumn && !thirdColumn.classList.contains('isSimulating')) {
      if (
        openSettings &&
        openSearchButton &&
        convertButton &&
        openSearch &&
        stageTwoHelp &&
        stageThreeHelp &&
        manualConfig &&
        readOnlyConfig &&
        openHelpButton &&
        openHelp &&
        openSettingsButton
      ) {
        openSettings.className = 'hidden';
        openSearchButton.classList.remove('hidden');
        openSearchButton.classList.add('bg-active');
        openHelpButton.classList.remove('bg-active');
        openHelp.className = 'hidden';
        openSettingsButton.classList.remove('bg-active');
        convertButton.classList.remove('hidden');
        openSearch.classList.remove('hidden');
        stageTwoHelp.className = 'hidden';
        stageThreeHelp.classList.remove('hidden');
        manualConfig.classList.add('hidden');
        readOnlyConfig.classList.remove('hidden');
      }

      thirdColumn.classList.add('isSimulating');

      const valueColReg = registersTable.getColumn('value');
      if (valueColReg) {
        valueColReg.updateDefinition({
          ...valueColReg.getDefinition(),
          editor: undefined,
          editable: () => false
        });
      }

      const colDefs = memoryTable.getColumnDefinitions();

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

      memoryTable.setColumns(newColDefs);
    }
  }

  // const data = event.data;
  // switch (data.operation) {
  //   case 'hideRegistersView':
  //     hideRegistersView();
  //     break;
  //   case 'showRegistersView':
  //     showRegistersView();
  //     break;
  //   case 'selectRegister':
  //     selectRegister(data.register, table);
  //     break;
  //   case 'setRegister':
  //     setRegister(data.register, data.value, table);
  //     break;
  //   case 'clearSelection':
  //     table.deselectRow();
  //     break;
  //   case 'watchRegister':
  //     watchRegister(data.register, table);
  //     break;
  //   case 'settingsChanged':
  //     settingsChanged(data.settings, table);
  //     break;
  //   default:
  //     throw new Error('Unknown operation ' + data.operation);
  // }
}

function setupButtons(): void {
  const sections: string[] = [
    'openSearch',
    'openSettings',
    'openConvert1',
    'openHelp'
  ];
  const buttons: string[] = [
    'openSearchButton',
    'openSettingsButton',
    'openConvertButton',
    'openHelpButton'
  ];

  function showOnly(targetId: string, buttonId: string): void {
    // Ocultar todas las secciones
    sections.forEach((id) => {
      const element = document.getElementById(id);
      if (element) {
        element.className =
          id === targetId
            ? 'flex flex-1 flex-col max-h-dvh min-h-dvh overflow-y-scroll'
            : 'hidden';
      }
    });

    buttons.forEach((btnId) => {
      document.getElementById(btnId)?.classList.remove('bg-active');
    });

    document.getElementById(buttonId)?.classList.add('bg-active');
  }

  // Asignar eventos a los botones
  document
    .getElementById('openSearchButton')
    ?.addEventListener('click', () =>
      showOnly('openSearch', 'openSearchButton')
    );
  document
    .getElementById('openSettingsButton')
    ?.addEventListener('click', () =>
      showOnly('openSettings', 'openSettingsButton')
    );
  document
    .getElementById('openConvertButton')
    ?.addEventListener('click', () =>
      showOnly('openConvert1', 'openConvertButton')
    );
  document
    .getElementById('openHelpButton')
    ?.addEventListener('click', () => showOnly('openHelp', 'openHelpButton'));
}


function setupSettings() {
  const inputMemorySize = document.getElementById(
    'memorySizeInput'
  ) as HTMLInputElement;
  inputMemorySize.value = '32';
  inputMemorySize.addEventListener('input', () => {
    console.log('Memory size changed to: ' + inputMemorySize.value);
    sendMessageToExtension({
      command: 'event',
      object: { name: 'memorySizeChanged', value: inputMemorySize.value }
      // from: 'registerView',
      // message: 'registerUpdate',
      // name: rawName,
      // value: value
    });
  });
}



function setUpHelp() {
  const openShowCard = document.getElementById('openShowCard');

  if (!openShowCard) {
    console.error('Help button not found');
    return;
  }

  openShowCard.addEventListener('click', () => {
    sendMessageToExtension({
      command: 'event',
      object: { name: 'clickOpenRISCVCard', value: 'openHelp' }
      // from: 'registerView',
      // message: 'registerUpdate',
      // name: rawName,
      // value: value
    });
  });
  

}


/**
 * View extension communication.
 * @param messageObject message to send to the extension
 */
function sendMessageToExtension(messageObject: any) {
  vscode.postMessage(messageObject);
}



