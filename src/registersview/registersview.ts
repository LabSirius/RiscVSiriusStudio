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

import { RegistersTable } from './registersTable';
import { MemoryTable } from './memoryTable';
import { setUpConvert } from './convertTool';
import { UIManager } from './uiManager';
import { InternalRepresentation } from '../utilities/riscvc';
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
  // let registersTable = registersSetup();
  const registersTable = new RegistersTable();
  const memoryTable = new MemoryTable();
  window.addEventListener('message', (event) => {
    dispatch(event, registersTable, memoryTable);
  });

  setupButtons();
  // setupSearchInRegisterTable(registersTable);
  // setUpMemoryConfig(memoryTable);
  // setupImportRegisters(registersTable);
  // setupImportMemory(memoryTable);
  setUpConvert();
  setupSettings(memoryTable);
  setUpHelp();
}

function dispatch(
  event: MessageEvent,
  registersTable: RegistersTable,
  memoryTable: MemoryTable
) {
  log({ msg: 'Dispatching message', data: event.data });
  const data = event.data;
  switch (data.operation) {
    case 'uploadProgram':
      uploadProgram(memoryTable, data.program);
      break;
    case 'step':
      step(memoryTable, registersTable, data.pc);
      break;
    case 'setRegister':
      setRegister(registersTable, memoryTable, data.register, data.value);
      break;
    default:
      log({ msg: 'No handler for message', data: data.operation });
      break;
  }
}

function uploadProgram(memoryTable: MemoryTable, ir: InternalRepresentation): void {
  UIManager.getInstance().simulationStarted();
  memoryTable.uploadProgram(ir);
  memoryTable.allocateMemory();
}

function step(memoryTable: MemoryTable, registersTable: RegistersTable, pc: number): void {
  log({ msg: "Simulator reported step" });
  if (!UIManager.getInstance().isSimulating) {
    UIManager.getInstance().sim();
    memoryTable.disableEditors();
  }
  memoryTable.updatePC(pc);
}

function setRegister(
  registersTable: RegistersTable, memoryTable: MemoryTable,
  register: string, value: string
): void {
  registersTable.setRegister(register, value);
  if (register === 'x2') {
    memoryTable.setSP(value);
  }
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


function setupSettings(memoryTable: MemoryTable) {
  const inputMemorySize = document.getElementById(
    'memorySizeInput'
  ) as HTMLInputElement;
  inputMemorySize.value = '32';
  inputMemorySize.addEventListener('input', () => {
    console.log('Memory size changed to: ' + inputMemorySize.value);
    sendMessageToExtension({
      command: 'event',
      object: { name: 'memorySizeChanged', value: inputMemorySize.value }
    });
    const newSize = Number.parseInt(inputMemorySize.value);
    memoryTable.resizeMemory(newSize);
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



